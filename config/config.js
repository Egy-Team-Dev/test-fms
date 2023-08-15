// const development_domain_server = "http://192.168.1.37:5555/";
// const development_domain_server = "https://sr-fms-api.herokuapp.com/";
//const development_domain_server = "https://api.v6.saferoad.net/";
const development_domain_server =
  "https://fms-dev-api-hcr64pytia-ez.a.run.app/";
// const development_domain_server = "http://192.168.1.47:5555/";
const development_path_server = "";
// const dashcam_saferoad = "http://dashcam.saferoad.net:9966/vss/user/apiLogin.action?username=admin&password=21232f297a57a5a743894a0e4a801fc3"
// http://192.168.1.26:5555/

// const production_domain_server = "https://sr-fms-api.herokuapp.com/";
//const production_domain_server = "https://api.v6.saferoad.net/";
const production_domain_server = "https://fms-api-hcr64pytia-ez.a.run.app/";
const production_path_server = "";

const development = {
  apiGateway: {
    URL: development_domain_server + development_path_server,
    imgSrc: "http://localhost/lapiastore-api/public/",
  },
  firebase_config: {
    databaseURL: "https://saferoad-srialfb.firebaseio.com",
    databaseURLDues: "https://saferoad-dues.firebaseio.com",
  },
};

const production = {
  apiGateway: {
    URL: production_domain_server + production_path_server,
    imgSrc: production_domain_server + "admin/public/",
  },
  firebase_config: {
    databaseURL: "https://saferoad-srialfb.firebaseio.com",
    databaseURLDues: "https://saferoad-dues.firebaseio.com",
  },
};

const config = process.env.NODE_ENV === "production" ? production : development;

export default config;
