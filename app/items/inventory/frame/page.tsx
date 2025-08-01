"use client"

import { pageInventoryForUserQuery } from "@/__generated__/pageInventoryForUserQuery.graphql";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import DecoParser from "../../../../components/DecoParser";

export default function FramePage() {

    const { inventoryForUser } =
              useLazyLoadQuery<pageInventoryForUserQuery>(
                graphql`
                  query pageInventoryForUserQuery {
                    inventoryForUser {
                      items {
                        equipped
                        id
                        uniqueDescription
                        unlocked
                      }
                      unspentPoints
                      userId
                    }
                  }
                `,
                {}
              );

          const itemIds = inventoryForUser.items.map(item => item.id);

          console.log(itemIds)

          const itemsParsed = DecoParser(itemIds, "profilePicFrames")

          console.log(itemsParsed)

    return (
        <div>
            <h2>🎁 Lottery</h2>
            <p>Hier kannst du eine Lootbox öffnen und dein Glück versuchen!</p>
        </div>
    );
}