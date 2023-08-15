import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Edit from "components/preventiveMaintenance/Edit";

const EditPreventive = () => {
  const router = useRouter();
  const { id } = router.query;

  return <Edit model={false} id={id} />;
};

export default EditPreventive;

// translation ##################################
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["main","preventiveMaintenance"])),
    },
  };
}
// translation ##################################
