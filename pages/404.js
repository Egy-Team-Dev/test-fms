import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import React from "react";

const PageNotFound = () => {
  return (
    <Image layout="fill" src="/404.svg" alt="" />
    // <div className="d-flex justify-content-center align-items-center">
    // </div>
  );
};

export default PageNotFound;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "main",
      ])),
    },
  };
}
// translation ##################################