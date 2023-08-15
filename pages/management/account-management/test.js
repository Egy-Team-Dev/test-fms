import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form, FormCheck } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import data from "../../../data/static.json";
import {
    faMapMarked,
    faHistory,
    faBell,
    faCar,
    faCalendarAlt,
    faClock,
    faTachometerAlt,
    faMapMarkerAlt,
    faCogs,
    faUsers,
    faUsersCog,
    faCertificate,
    faUsersSlash,
    faCog,
    faListUl,
    faClipboardList,
    faLaptop,
    faTools,
    faDollarSign,
    faArrowLeft,
    faArrowRight,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import AccountManagement from "./[id]/index";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { add, empty } from "../../../lib/slices/accountInfo";
import Link from "next/link";

const icoNames = {
    faMapMarked,
    faHistory,
    faBell,
    faCar,
    faCalendarAlt,
    faClock,
    faTachometerAlt,
    faMapMarkerAlt,
    faCogs,
    faUsers,
    faUsersCog,
    faCertificate,
    faUsersSlash,
    faCog,
    faListUl,
    faClipboardList,
    faLaptop,
    faTools,
    faDollarSign,
    faArrowLeft,
    faArrowRight,
    faTimes,
};

const subScription = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [subScriptionData, setSubScriptionData] = useState([]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        setSubScriptionData(data[0].subScription);
    }, []);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const dispatch = useDispatch();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const accountInfo = useSelector((state) => state?.accountInfo);

    const handleAddSubScriptionVal = (id, title, price) => {
        let allD = [...subScriptionData];

        allD?.map((item) => {
            if (item.id === id) {
                let FiltredData = item.selectedData.filter((itemFiltred) =>
                    itemFiltred.includes(title)
                );

                if (FiltredData.length > 0) {
                    let FiltredData = item.selectedData.filter(
                        (itemFiltred) => !itemFiltred.includes(title)
                    );
                    item.selectedData = FiltredData;
                    item.data?.map((itemData) => {
                        if (itemData.title === title && itemData.price === price) {
                            itemData.active = "Active";
                        }
                    });
                } else {
                    item.selectedData.push([title, price]);
                    item.data?.map((itemData) => {
                        if (itemData.title === title && itemData.price === price) {
                            itemData.active = "DeActive";
                        }
                    });
                }
            }
        });
        setSubScriptionData(allD);
    };

    const handleAddSubScription = () => {
        dispatch(add(subScriptionData));
        // data[0].subScription?.map((item) => {
        //   item.selectedData = [];
        // });
        router.push("/management/account-management/ConfirmationAccount");
    };

    const handleDeleteAllDataWithGoToMainPage = () => {
        dispatch(empty());
        router.push("/management/account-management/22");
    };

    return (
        <div className="container-fluid">
            <Row>
                <Col>
                    <Card>
                        <Card.Body className="overflow-hidden">
                            <div className="header-title"></div>
                            <Row>
                                <Col md="12">
                                    {subScriptionData?.map((item, key) => {
                                        return (
                                            <div
                                                className="border border-light rounded p-4 my-3"
                                                key={item.id}
                                            >
                                                <h4>{item.name}</h4>
                                                <hr className="my-3" />
                                                <Row>
                                                    {item.data?.map((el, keyEl) => {
                                                        let icoName;
                                                        let selectIconame = icoNames[el.icon];
                                                        if (selectIconame) {
                                                            icoName = (
                                                                <FontAwesomeIcon
                                                                    className="fa-2x"
                                                                    icon={selectIconame}
                                                                    size="lg"
                                                                />
                                                            );
                                                        }
                                                        return (
                                                            <>
                                                                <Col md="12" lg="6" key={keyEl}>
                                                                    <Card className="border border-light">
                                                                        <Card.Body>
                                                                            <div className="d-flex justify-content-between align-itmes-center">
                                                                                <div className="d-flex ">
                                                                                    <div className="d-flex justify-content-center align-items-center">
                                                                                        <div
                                                                                            className={`p-3 rounded ${el.classIco}`}
                                                                                        >
                                                                                            {icoName}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="d-flex flex-column justify-content-center p-3">
                                                                                        <h5>{el.title}</h5>
                                                                                        <p className="mb-0">
                                                                                            {el.price} SAR/Month
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="d-flex flex-column justify-content-between">
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleAddSubScriptionVal(
                                                                                                item.id,
                                                                                                el.title,
                                                                                                el.price
                                                                                            )
                                                                                        }
                                                                                        className="btn btn-outline-primary p-2 m-1 active"
                                                                                    >
                                                                                        {el.active}
                                                                                    </button>
                                                                                    <button className="btn btn-outline-primary p-2 m-1">
                                                                                        suspend
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </Card.Body>
                                                                    </Card>
                                                                </Col>
                                                            </>
                                                        );
                                                    })}
                                                </Row>
                                            </div>
                                        );
                                    })}
                                </Col>

                                <Col md="12" className="border border-light rounded p-3">
                                    <h4>Subscriptions List</h4>
                                    <hr className="my-3" />
                                    {subScriptionData?.map((item, key) => (
                                        <>
                                            {item.selectedData.length > 0 && (
                                                <div key={key}>
                                                    <span>{item.name}</span>
                                                    {item.selectedData?.map((itemSub, keySub) => (
                                                        <div
                                                            key={keySub}
                                                            className="d-flex ms-5 justify-content-between w-50 mb-1 text-dark bg-light"
                                                        >
                                                            <span className=" d-block w-100 fw-bold ps-3 pt-2 pb-2">
                                                                {itemSub[0]}
                                                            </span>
                                                            <span className="d-block w-50 fw-bold ps-3 pt-2 pb-2">
                                                                ({itemSub[1]} SAR/Month)
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ))}
                                </Col>
                            </Row>
                            <div className="mt-5 d-flex justify-content-end">
                                <Link href="/management/account-management/CreateAdminUser">
                                    <button className="btn btn-primary px-3 py-2 ms-3">
                                        <FontAwesomeIcon
                                            className="me-2"
                                            icon={faArrowLeft}
                                            size="sm"
                                        />
                                        Back
                                    </button>
                                </Link>
                                <button
                                    onClick={() => handleAddSubScription()}
                                    className="btn btn-primary px-3 py-2 ms-3"
                                >
                                    <FontAwesomeIcon
                                        className="me-2"
                                        icon={faArrowRight}
                                        size="sm"
                                    />
                                    Next
                                </button>
                                <button
                                    className="btn btn-primary px-3 py-2 ms-3"
                                    onClick={() => handleDeleteAllDataWithGoToMainPage()}
                                >
                                    <FontAwesomeIcon className="me-2" icon={faTimes} size="sm" />
                                    Cancel
                                </button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
export default subScription;

// translation ##################################
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["main"])),
        },
    };
}
// translation ##################################