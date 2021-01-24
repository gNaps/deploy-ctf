import styles from "../styles/Confirm.module.css";

const Confirm = ({ yes, no, loading }) => {
    return (
        <div className={styles.modal}>
            <div className={styles.modal_content}>
                <div className={styles.modal_header}>Warning</div>
                <div className={styles.modal_body}>
                    {!loading && (
                        <>
                            <p>Deploy this market?</p>
                            <div>
                                <button
                                    className={styles.button}
                                    onClick={yes}
                                    disabled={loading}
                                >
                                    Yes
                                </button>
                                <button
                                    className={styles.button_no}
                                    onClick={no}
                                >
                                    No
                                </button>
                            </div>
                        </>
                    )}
                    {loading && (
                        <>
                            <p>Loading</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Confirm;
