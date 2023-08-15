import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import CustomizedSteppers from "components/stepper";
import { useRouter } from "next/router";
import { fetchAllScheduledReports } from "services/scheduledReports";

const EditScheduledReports = () => {
  const router = useRouter();
  const { id } = router.query;

  const [reportData, setReportData] = useState({});


  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetchAllScheduledReports();
        setReportData(
          ...response.userReport.filter((report) => report._id === id)
        );
      } catch (error) {
        console.log(error);
      }
    };
    fetchReport();
    return () => {
      setReportData([]);
    };
  }, [id]);



  const { t } = useTranslation(["scheduledReports", "common", "main"]);
  return (
    <div className="container mt-5">
      <CustomizedSteppers reportData={reportData} />
    </div>
  );
};

export default EditScheduledReports;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "scheduledReports",
        "common",
        "main",
      ])),
    },
  };
}
// translation ##################################
export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
