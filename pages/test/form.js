import { Formik, Form } from "formik";
import * as Yup from "yup";
import React from "react";
import Input from "components/formik/Input";
import ReactSelect from "components/formik/ReactSelect/ReactSelect";
import RadioInput from "components/formik/RadioInput";
import Checkbox from "components/formik/Checkbox";
import { Button } from "react-bootstrap";

const FormikContainer = () => {
  const reactSelectOptions = [
    {
      value: "dog",
      label: "popy",
    },
    {
      value: "cat",
      label: "susy",
    },
  ];
  const initialValues = {
    email: "",
    text: "",
    reactSelect: "",
    radioOption: [],
    checkboxOption: [],
  };
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    text: Yup.string().required("Required"),
    // reactSelect: Yup.string().required("Required").min(1, "custom message"),
    reactSelect: Yup.array().required("Required").min(1, "custom message"),
    radioOption: Yup.string().required("Required"),
    checkboxOption: Yup.array().required("Required").min(1, "custom message"),
  });
  const onSubmit = (values) => {
    console.log(values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <Form className="mt-5">
          <Input
            placeholder="Enter your email"
            label="Email"
            name="email"
            type="email"
            className={"col-12 col-md-6 col-lg-4 mb-3"}
          />
          <Input
            placeholder="Enter your text"
            label="text"
            name="text"
            type="text"
            className={"col-12 col-md-6 col-lg-4 mb-3"}
          />
          <ReactSelect
            options={reactSelectOptions}
            label="Select animal name"
            name="reactSelect"
            placeholder={"Select an animal"}
            className={"col-12 col-md-6 col-lg-4 mb-3"}
            // defaultValue={{  should put its value in intialValues also
            //   value: "dog",
            //   label: "popy",
            // }}
            // isSearchable={true}
            // isDisabled={true}
            isMulti={true}
          />
          <RadioInput
            name="radioOption"
            label={"Select option"}
            option={{
              value: "1",
              key: "asd",
            }}
            className={"mb-3"}
          />
          <Checkbox
            name="checkboxOption"
            label={"Select option"}
            option={[{
              value: "1",
              key: "asd",
            }]}
            className={"mb-3"}
          />
          <Button type="submit" disabled={!formik.isValid}>
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default FormikContainer;
