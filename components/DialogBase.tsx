import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { FormikProps, useFormik } from "formik";
import { useEffect, useState } from "react";
import { ObjectSchema } from "yup";
import { Form, FormSection } from "./Form";
import { FormErrors } from "./FormErrors";

export type FieldOptions<T extends object> = {
  key: keyof T;
  label: string;
  required: boolean;
} & (
  | {
      type: "text";
      multiline?: boolean;
    }
  | {
      type: "date";
      minDate?: Dayjs;
      maxDate?: Dayjs;
      beforeOther?: keyof T;
      afterOther?: keyof T;
      defaultMonthDate?: Dayjs;
    }
);
export type SectionOptions<T extends object> = {
  label: string;
  subtitle?: string;
  fields: FieldOptions<T>[];
};

export function DialogBase<T extends { [k in string]: any }>({
  title,
  open,
  error,
  inProgress = false,
  sections,
  initialValues,
  validationSchema,
  onSubmit = () => {},
  onClose = () => {},
  onDelete,
  clearError = () => {},
}: {
  title: string;
  open: boolean;
  error?: any;
  inProgress?: boolean;
  sections: SectionOptions<T>[];
  initialValues: T;
  validationSchema: ObjectSchema<T>;
  onSubmit?: (values: T) => void;
  onClose?: () => void;
  onDelete?: () => void;
  clearError?: () => void;
}) {
  const formik = useFormik<T>({
    initialValues,
    validationSchema,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className="relative">
        <FormErrors error={error} onClose={clearError} />
        <Form>
          {sections.map((section) => (
            <FormSection
              key={section.label}
              title={section.label}
              subtitle={section.subtitle}
            >
              {section.fields.map((field) => (
                <Field
                  formik={formik}
                  key={field.key as string}
                  field={field}
                />
              ))}
            </FormSection>
          ))}
        </Form>
        {inProgress && (
          <div className="absolute inset-0 bg-white z-10 flex justify-center items-center">
            <CircularProgress />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        {onDelete && (
          <>
            <Button color="warning" disabled={inProgress} onClick={onDelete}>
              Delete
            </Button>
            <div className="grow"></div>
          </>
        )}
        <Button disabled={inProgress} onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!formik.isValid || inProgress}
          onClick={() => onSubmit(formik.values)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Field<T extends object>({
  formik,
  field,
}: {
  formik: FormikProps<T>;
  field: FieldOptions<T>;
}) {
  const hasError = formik.touched[field.key] && !!formik.errors[field.key];
  const errorText =
    formik.touched[field.key] && (formik.errors[field.key] as string);

  switch (field.type) {
    case "text":
      return (
        <TextField
          id={field.key as string}
          label={field.label}
          value={formik.values[field.key]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={hasError}
          helperText={errorText}
          required={field.required}
          multiline={field.multiline}
          fullWidth={field.multiline}
        />
      );
    case "date":
      return (
        <DatePicker
          label={field.label}
          value={formik.values[field.key]}
          // @ts-ignore
          minDate={
            (field.afterOther ? formik.values[field.afterOther] : null) ??
            field.minDate
          }
          // @ts-ignore
          maxDate={
            (field.beforeOther ? formik.values[field.beforeOther] : null) ??
            field.maxDate
          }
          // @ts-ignore
          defaultCalendarMonth={field.defaultMonthDate}
          onChange={(value) => formik.setFieldValue(field.key as string, value)}
          slotProps={{
            textField: {
              id: field.key as string,
              required: field.required,
              error: hasError,
              helperText: errorText,
              onBlur: formik.handleBlur,
            },
          }}
        />
      );
  }
}
