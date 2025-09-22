import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Paper, List, ListItem, ListItemText } from '@mui/material';
import { ReactRenderer } from '@tiptap/react';
import type { SuggestionProps } from '@tiptap/suggestion';
import Mention from '@tiptap/extension-mention';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import 'tippy.js/themes/light-border.css';

type User = { id: string; name: string; };

type MentionListProps = Pick<SuggestionProps<User>, 'items' | 'command'>;

// Renders the list of suggestions
const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // whenever the list of suggestions changes (e.g., when the user types more characters).
  useEffect(() => setSelectedIndex(0), [props.items]);

  // Called when a user is selected via a click or by pressing Enter.
  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.name });
    }
  };

  // Creates a "remote control" for Tiptap.
  // This allows Tiptap to forward keyboard events to this component
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <Paper elevation={3}>
      <List dense>
        {props.items.length > 0 ? props.items.map((item, index) => (
          <ListItem
            key={item.id}
            button
            onClick={() => selectItem(index)}
            sx={{ backgroundColor: index === selectedIndex ? 'action.hover' : 'transparent' }}
          >
            <ListItemText primary={item.name} />
          </ListItem>
        )) : <ListItem><ListItemText primary="No Results" /></ListItem>}
      </List>
    </Paper>
  );
});
MentionList.displayName = 'MentionList';

export const createMentionExtension = (users: User[]) => {
  // Config for Tiptap with Tippy.js
  const suggestionConfig = {
    // Filters our `users` list based on the input (`query`) after the @ symbol.
    items: ({ query }: { query: string }): User[] => {
      return users
        .filter((item) =>
          item.name.toLowerCase().startsWith(query.toLowerCase())
        )
        .slice(0, 5);
    },

    // Controls the lifecycle of the pop-up using Tippy.js
    render: () => {
      let component: ReactRenderer<any>;
      let popup: TippyInstance;

      return {
        // Called when the user types '@' --> Creates the pop-up
        onStart: (props: SuggestionProps<User>) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });
          const rect = props.clientRect ? props.clientRect() : null;
          if (!rect) return;

          popup = tippy(document.body, {
            getReferenceClientRect: () => rect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
            theme: "light-border",
          });
        },

        // Called when the user types more and the suggestions change
        onUpdate: (props: SuggestionProps<User>) => {
          component.updateProps(props);
          const rect = props.clientRect ? props.clientRect() : null;
          if (!rect) return;
          popup.setProps({ getReferenceClientRect: () => rect });
        },

        // Forwards keyboard events to our `MentionList` component.
        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === "Escape") {
            popup.hide();
            return true;
          }
          return component.ref?.onKeyDown(props);
        },

        // Called when the suggestions are no longer needed. Cleans up.
        onExit: () => {
          if (popup) popup.destroy();
          if (component) component.destroy();
        },
      };
    },
  };

  return Mention.configure({
    HTMLAttributes: { class: 'mention' },
    suggestion: suggestionConfig,
  });
}
