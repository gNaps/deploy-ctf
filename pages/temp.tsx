import { Web3Provider } from "@ethersproject/providers";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Button,
    Checkbox,
    createStyles,
    FormControlLabel,
    makeStyles,
    MenuItem,
    Select,
    TextField,
    Theme,
} from "@material-ui/core";
import {
    DatePicker,
    DatePickerProps,
    TimePicker,
    TimePickerProps,
} from "@material-ui/pickers";
import { Market } from "@polymarket/registry-v0-sdk";
import { useWeb3React } from "@web3-react/core";
import cx from "classnames";
import { DateTime } from "luxon";
import { useRouter } from "next/dist/client/router";
import React, { BaseSyntheticEvent, useState } from "react";
import {
    Controller,
    DeepMap,
    FieldError,
    useForm,
    useWatch,
} from "react-hook-form";
import { mutate } from "swr";
import { object, string } from "yup";

import { SwrKey } from "../../api/swrKey";
import { useRegistryContext } from "../../context/RegistryContext";
import { useToastContext } from "../../context/ToastContext";
import { TxState, useTxState } from "../../hooks/useTxState";
import { MarketType } from "../../interfaces";
import BinaryIcon from "../../static/icons/BinaryIcon";
import CategoryIcon from "../../static/icons/CategoryIcon";
import PlusIcon from "../../static/icons/PlusIcon";
import ScalarIcon from "../../static/icons/ScalarIcon";
import colors from "../../theme/colors";
import {
    useButtonStyles,
    useCardStyles,
    useDefaultMuiInputStyles,
    useExternalLinkStyles,
    usePageTitleStyles,
} from "../../theme/muiStyleHooks";
import { borderRadius } from "../../theme/styledHelpers";
import { Location } from "../../utils/location";
import { ButtonTxFail, ButtonTxLoading, ButtonTxSuccess } from "../buttons";
import DetailHeader from "../DetailHeader";
import MetaDataList, { IMetaDataList } from "../MetaDataList";
import {
    Heebo14Black500,
    Heebo14Error500,
    Heebo16Black400,
    Heebo16Blue500,
    Heebo30White500,
} from "../typography";
import MarketSectionWrapper from "./MarketSectionWrapper";
import OutcomeInput from "./OutcomeInput";
import QuestionTypeCard from "./QuestionTypeCard";

//-------------------------
// STYLES
//-------------------------

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        wrapper: {
            width: "350px",
        },
        card: {
            padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
        },
        input: {
            borderRadius: `${borderRadius}px`,
        },
        input__date: {
            borderRadius: `${borderRadius}px`,
            border: `1px solid ${colors.opaqueBlack10}`,
            width: "50%",
            padding: "18.5px 14px", // hardcode match the default mui input padding
            [theme.breakpoints.down("md")]: {
                width: "100%",
            },
        },
        input__date__middle: {
            margin: `0 ${theme.spacing(2)}px`,
            [theme.breakpoints.down("md")]: {
                margin: `${theme.spacing(2)}px 0`,
            },
        },
        date_wrapper: {
            display: "flex",
            [theme.breakpoints.down("md")]: {
                flexDirection: "column",
            },
        },
        checkbox_label: {
            marginTop: theme.spacing(2),
        },
        checkbox: {
            "&:hover": {
                backgroundColor: "transparent !important",
            },
        },
        input__denomination: {
            width: "50%",
            paddingRight: theme.spacing(3),
            [theme.breakpoints.down("md")]: {
                width: "100%",
                paddingRight: 0,
            },
        },
        label_wrapper: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(1),
        },
        questionType_wrapper: {
            display: "flex",
            [theme.breakpoints.down("md")]: {
                flexDirection: "column",
            },
        },
        outcomes_wrapper: {
            display: "flex",
            flexWrap: "wrap",
            [theme.breakpoints.down("md")]: {
                flexDirection: "column",
            },
        },
        addOutcome_button: {
            marginLeft: theme.spacing(3),
            backgroundColor: colors.opaqueBlack08,
        },
        addOutcome_text: {
            marginLeft: theme.spacing(1),
        },
        ctaButton_wrapper: {
            marginTop: theme.spacing(4),
            marginBottom: theme.spacing(2),
            display: "flex",
            justifyContent: "center",
        },
        review_wrapper: {
            marginTop: theme.spacing(3),
            marginBottom: theme.spacing(3),
        },
        noPadding: {
            padding: 0,
        },
        button__loading: {
            backgroundColor: theme.palette.primary.light,
        },
    });
});

const useErrorStyles = makeStyles((theme: Theme) => {
    return createStyles({
        wrapper: {
            marginTop: theme.spacing(1),
            minHeight: theme.spacing(3),
        },
    });
});

//-------------------------
// TYPES
//-------------------------

enum FormState {
    Create = "create",
    Review = "review",
}

enum Form {
    Question = "question",
    QuestionType = "questionType",
    Outcomes = "outcomes",
    OutcomeUnit = "outcomeUnit",
    ResolutionDate = "resolutionDate",
    ResolutionTZ = "resolutionTimezone",
    HasNoResolutionDate = "hasNoResolutionDate",
    Description = "description",
    ResolutionSource = "resolutionSource",
    Oracle = "oracle",
}

interface FormTypes {
    [Form.Question]: string;
    [Form.QuestionType]: MarketType;
    [Form.Outcomes]: string[];
    [Form.OutcomeUnit]: string;
    [Form.Description]: string;
    [Form.ResolutionDate]: DateTime;
    [Form.ResolutionTZ]: string;
    [Form.HasNoResolutionDate]: boolean;
    [Form.ResolutionSource]: string;
    [Form.Oracle]: string;
}

enum Timezone {
    UTC = "UTC",
}

//-------------------------
// VALIDATION
//-------------------------

const schema = object().shape({
    [Form.Question]: string()
        .required("Question is required")
        .min(2, "Question must be longer")
        .max(500, "Question must be shorter"),
    [Form.QuestionType]: string().required("Question Type is required"),
    [Form.Description]: string().required("Description is required"),
    // this works, but what do we want here
    // [Form.Outcomes]: array()
    //     .required("Outcomes are required")
    //     .when(Form.QuestionType, {
    //         is: MarketType.Binary,
    //         then: array().length(2, "There can be only two outcomes"),
    //     })
    //     .when(Form.QuestionType, {
    //         is: MarketType.Categorical,
    //         then: array().max(10, "Too many options"),
    //     })
    //     .when(Form.QuestionType, {
    //         is: MarketType.Scalar,
    //         then: array().of(number()),
    //     }),
    // [Form.OutcomeUnit]: string().required("Outcome Unit is required"),

    [Form.ResolutionSource]: string()
        .required("Resolution Source is required")
        .matches(
            // regex from here => https://urlregex.com/
            // eslint-disable-next-line
            /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/,
            "Enter a valid url",
        ),
    [Form.Oracle]: string()
        .required("Oracle is required")
        .test(
            "len",
            "Oracle must be a valid address",
            (val) => val?.length === 42 ?? false,
        ),
});

//-------------------------
// HELPERS
//-------------------------

const hasError = (key: Form, errors: DeepMap<FormTypes, FieldError>) => {
    return errors[key] !== undefined;
};

const isScalar = (type: MarketType) => type === MarketType.Scalar;

const isCategorical = (type: MarketType) => type === MarketType.Categorical;

const formatValuesForReview = (values: FormTypes): IMetaDataList[] => {
    const hasNoResolutionDate = values[Form.HasNoResolutionDate];

    return (
        Object.keys(values)
            .filter((k) => values[k as Form] !== "")
            .filter((k) => {
                if (hasNoResolutionDate && k === Form.ResolutionDate) {
                    return false;
                }
                if (hasNoResolutionDate && k === Form.ResolutionTZ) {
                    return false;
                }
                if (!hasNoResolutionDate && k === Form.HasNoResolutionDate) {
                    return false;
                }
                return true;
            })
            // format list for metadata list
            .map((k) => ({
                title: k,
                description: values[k as Form].toString(),
                isLink: false,
            }))
            // split camelCase words
            .map((obj) => ({
                ...obj,
                title: obj.title.split(/(?=[A-Z])/).join(" "),
            }))
    );
};

const timezones = [
    "Pacific/Pago_Pago",
    "Pacific/Honolulu",
    "America/Anchorage",
    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Argentina/Buenos_Aires",
    "America/Nuuk",
    "Atlantic/Cape_Verde",
    Timezone.UTC,
    "Europe/London",
    "Europe/Berlin",
    "Africa/Cairo",
    "Europe/Tallinn",
    "Africa/Nairobi",
    "Europe/Moscow",
    "Asia/Dubai",
    "Asia/Karachi",
    "Asia/Dhaka",
    "Asia/Bangkok",
    "Asia/Hong_Kong",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Pohnpei",
    "Pacific/Auckland",
];

//-------------------------
// COMPONENTS
//-------------------------

const ErrorComponent: React.FC<{
    formKey: Form;
    errors: DeepMap<FormTypes, FieldError>;
}> = ({ formKey, errors }) => {
    const errorStyles = useErrorStyles();
    return (
        <div className={errorStyles.wrapper}>
            {hasError(formKey, errors) ? (
                <Heebo14Error500>{errors[formKey]?.message}</Heebo14Error500>
            ) : null}
        </div>
    );
};

const DateWithRef = React.forwardRef<HTMLInputElement, DatePickerProps>(
    (props, ref) => <DatePicker inputRef={ref} {...props} />,
);

const TimeWithRef = React.forwardRef<HTMLInputElement, TimePickerProps>(
    (props, ref) => <TimePicker inputRef={ref} {...props} />,
);

const CreateMarket: React.FC = () => {
    const cardStyles = useCardStyles();
    const styles = useStyles();
    const pageTitleStyles = usePageTitleStyles();
    const externalLinkStyles = useExternalLinkStyles();
    const buttonStyles = useButtonStyles();
    const defaultMuiInputStyles = useDefaultMuiInputStyles();

    const [formState, setFormState] = useState<FormState>(FormState.Create);
    const [numOutcomeInputs, setNumOutcomeInputs] = useState(3); // Its ugly, but we cant conditionally set default values for Outcomes in order to get length :/
    const [valuesToReview, setValuesToReview] = useState<IMetaDataList[]>([]);

    const router = useRouter();
    const { registry } = useRegistryContext();
    const ctx = useWeb3React<Web3Provider>();
    const { setToast } = useToastContext();
    const { txState, setTxState, txExplorerUrl, setTxExplorerUrl } =
        useTxState();

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors, isDirty },
    } = useForm<FormTypes>({
        resolver: yupResolver(schema),
        defaultValues: {
            [Form.Question]: "",
            [Form.QuestionType]: MarketType.Binary,
            [Form.Outcomes]: ["", ""],
            [Form.OutcomeUnit]: "",
            [Form.ResolutionDate]: DateTime.utc(),
            [Form.ResolutionTZ]: Timezone.UTC,
            [Form.HasNoResolutionDate]: false,
            [Form.Description]: "",
            [Form.ResolutionSource]: "",
            [Form.Oracle]: "", // todo - this is polymarket's MIC address
        },
    });

    // todo - fix this
    // eslint-disable-next-line
    // @ts-ignore
    const questionType = useWatch({
        control,
        name: Form.QuestionType,
    });

    const handleOutcomeChange = (idx: number, newVal: string) => {
        const value = getValues(Form.Outcomes);
        setValue(Form.Outcomes, [
            ...value.slice(0, idx),
            newVal,
            ...value.slice(idx + 1),
        ]);
    };

    const handleOutcomeDelete = (idx: number) => {
        const value = getValues(Form.Outcomes);
        setValue(Form.Outcomes, [
            ...value.slice(0, idx),
            ...value.slice(idx + 1),
        ]);
        setNumOutcomeInputs(numOutcomeInputs - 1);
    };

    const handleReviewProposal = (values: FormTypes) => {
        const cleanListOfValuesToReview = formatValuesForReview(values);
        setValuesToReview(() => [...cleanListOfValuesToReview]);
        setFormState(FormState.Review);
    };

    const handleSubmitToSdk = async (values: FormTypes) => {
        if (!registry || !ctx || !ctx.account) {
            return;
        }

        setTxState(TxState.Submitting);

        const marketToSubmit: Market = {
            conditionID: "123", // todo - hook this up - prepareCondition()
            description: values[Form.Description],
            endDate: values[Form.HasNoResolutionDate]
                ? // this has to be a number... do we just put it far, far in the future?
                  values[Form.ResolutionDate]
                      .plus({ years: 5 })
                      .toUTC()
                      .toMillis()
                : values[Form.ResolutionDate].toUTC().toMillis(),
            marketMakerAddress: ctx.account, // todo - hook this up
            oracle: values[Form.Oracle],
            outcomes: values[Form.Outcomes].join(","),
            question: values[Form.Question],
            resolutionSource: values[Form.ResolutionSource],
        };

        try {
            const tx = await registry.proposeMarket(marketToSubmit);
            setTxExplorerUrl(tx.hash);
            setTxState(TxState.Success);
            mutate(SwrKey.Proposals);
            setToast({
                isToastOpen: true,
                toastMessage: "Proposal Submitted",
                toastSeverity: "success",
            });
            router.push(Location.Proposals);
        } catch (error) {
            // todo - error logging?
            setTxState(TxState.Failure);
            setToast({
                isToastOpen: true,
                toastMessage: `Error: ${JSON.stringify(error)}`,
                toastSeverity: "error",
            });
        }
    };

    return (
        <>
            <div className={pageTitleStyles.titleWrapper}>
                <Heebo30White500>Create</Heebo30White500>
            </div>
            <div className={cx(cardStyles.card_base, styles.card)}>
                {formState === FormState.Create ? (
                    <form onSubmit={handleSubmit(handleReviewProposal)}>
                        <MarketSectionWrapper sectionTitle="Question" isTop>
                            <Controller
                                control={control}
                                name={Form.Question}
                                render={({ field }) => (
                                    <>
                                        <TextField
                                            error={hasError(
                                                Form.Question,
                                                errors,
                                            )}
                                            className={styles.input}
                                            type="text"
                                            variant="outlined"
                                            fullWidth
                                            placeholder="Enter market question..."
                                            {...field}
                                        />
                                        <ErrorComponent
                                            formKey={Form.Question}
                                            errors={errors}
                                        />
                                    </>
                                )}
                            />
                        </MarketSectionWrapper>
                        <MarketSectionWrapper sectionTitle="Question Type">
                            <Controller
                                control={control}
                                name={Form.QuestionType}
                                render={({ field: { value } }) => {
                                    return (
                                        <div
                                            className={
                                                styles.questionType_wrapper
                                            }
                                        >
                                            {[
                                                {
                                                    title: MarketType.Binary,
                                                    body: `Two possible outcomes, like "Yes" and "No"`,
                                                    icon: <BinaryIcon />,
                                                },
                                                {
                                                    title: MarketType.Categorical,
                                                    body: `Multiple outcomes, like "Red", "Yellow", and "Blue"`,
                                                    icon: <CategoryIcon />,
                                                },
                                                {
                                                    title: MarketType.Scalar,
                                                    body: "A range of numbers, like between 0 and 100",
                                                    icon: <ScalarIcon />,
                                                },
                                            ].map((type, idx, arr) => (
                                                <QuestionTypeCard
                                                    key={type.title}
                                                    type={type}
                                                    onCardClick={() =>
                                                        setValue(
                                                            Form.QuestionType,
                                                            type.title,
                                                        )
                                                    }
                                                    isSelected={
                                                        value === type.title
                                                    }
                                                    isAMiddleCard={
                                                        idx !== 0 &&
                                                        idx !== arr.length - 1
                                                    }
                                                />
                                            ))}
                                        </div>
                                    );
                                }}
                            />
                            <ErrorComponent
                                formKey={Form.QuestionType}
                                errors={errors}
                            />
                        </MarketSectionWrapper>
                        <MarketSectionWrapper
                            sectionTitle={
                                isScalar(questionType) ? "Bounds" : "Outcomes"
                            }
                        >
                            <>
                                {isScalar(questionType) ? (
                                    <div className={styles.label_wrapper}>
                                        <Heebo16Black400>Range</Heebo16Black400>
                                    </div>
                                ) : null}
                                <div className={styles.outcomes_wrapper}>
                                    <Controller
                                        control={control}
                                        name={Form.Outcomes}
                                        render={({ field }) => {
                                            return (
                                                <>
                                                    {Array.from(
                                                        {
                                                            length: isCategorical(
                                                                questionType,
                                                            )
                                                                ? numOutcomeInputs
                                                                : 2,
                                                        },
                                                        (_, idx) => (
                                                            <OutcomeInput
                                                                key={`outcome-${idx}`}
                                                                idx={idx}
                                                                isScalar={isScalar(
                                                                    questionType,
                                                                )}
                                                                value={
                                                                    field.value[
                                                                        idx
                                                                    ]
                                                                }
                                                                handleChange={
                                                                    handleOutcomeChange
                                                                }
                                                                handleRemove={
                                                                    isCategorical(
                                                                        questionType,
                                                                    ) && idx > 2
                                                                        ? handleOutcomeDelete
                                                                        : undefined
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </>
                                            );
                                        }}
                                    />
                                </div>
                                {isCategorical(questionType) ? (
                                    <Button
                                        className={styles.addOutcome_button}
                                        variant="contained"
                                        onClick={() =>
                                            setNumOutcomeInputs(
                                                numOutcomeInputs + 1,
                                            )
                                        }
                                    >
                                        <PlusIcon />
                                        <div className={styles.addOutcome_text}>
                                            <Heebo14Black500>
                                                Add outcome
                                            </Heebo14Black500>
                                        </div>
                                    </Button>
                                ) : null}
                                {isScalar(questionType) ? (
                                    <Controller
                                        control={control}
                                        name={Form.OutcomeUnit}
                                        render={({ field }) => (
                                            <>
                                                <div
                                                    className={
                                                        styles.label_wrapper
                                                    }
                                                >
                                                    <Heebo16Black400>
                                                        Unit of measurement
                                                    </Heebo16Black400>
                                                </div>
                                                <TextField
                                                    type="text"
                                                    className={cx(
                                                        styles.input,
                                                        styles.input__denomination,
                                                    )}
                                                    variant="outlined"
                                                    fullWidth
                                                    placeholder="Denomination"
                                                    {...field}
                                                />
                                                <ErrorComponent
                                                    formKey={Form.OutcomeUnit}
                                                    errors={errors}
                                                />
                                            </>
                                        )}
                                    />
                                ) : null}
                                {!isScalar(questionType) ? (
                                    <ErrorComponent
                                        formKey={Form.Outcomes}
                                        errors={errors}
                                    />
                                ) : null}
                            </>
                        </MarketSectionWrapper>
                        <MarketSectionWrapper sectionTitle="Resolution Date">
                            <div className={styles.date_wrapper}>
                                <Controller
                                    control={control}
                                    name={Form.ResolutionDate}
                                    render={({ field }) => {
                                        const { ref } = field;
                                        return (
                                            <>
                                                <DateWithRef
                                                    {...field}
                                                    ref={ref}
                                                    className={cx(
                                                        styles.input__date,
                                                        defaultMuiInputStyles.input_muiHover,
                                                    )}
                                                    error={hasError(
                                                        Form.ResolutionDate,
                                                        errors,
                                                    )}
                                                    InputProps={{
                                                        disableUnderline: true,
                                                    }}
                                                    // eslint-disable-next-line
                                                    inputProps={{
                                                        className:
                                                            styles.noPadding,
                                                    }}
                                                />
                                                <TimeWithRef
                                                    {...field}
                                                    ref={ref}
                                                    className={cx(
                                                        styles.input__date,
                                                        styles.input__date__middle,
                                                        defaultMuiInputStyles.input_muiHover,
                                                    )}
                                                    error={hasError(
                                                        Form.ResolutionDate,
                                                        errors,
                                                    )}
                                                    inputProps={{
                                                        className:
                                                            styles.noPadding,
                                                    }}
                                                    // eslint-disable-next-line
                                                    InputProps={{
                                                        disableUnderline: true,
                                                    }}
                                                />
                                            </>
                                        );
                                    }}
                                />
                                <Controller
                                    control={control}
                                    name={Form.ResolutionTZ}
                                    render={({ field }) => {
                                        return (
                                            <div
                                                className={cx(
                                                    styles.input__date,
                                                    defaultMuiInputStyles.input_muiHover,
                                                )}
                                            >
                                                <Select
                                                    classes={{
                                                        root: styles.noPadding,
                                                    }}
                                                    disableUnderline
                                                    fullWidth
                                                    {...field}
                                                    onChange={(
                                                        e: BaseSyntheticEvent,
                                                    ) => {
                                                        const luxonDate =
                                                            getValues(
                                                                Form.ResolutionDate,
                                                            );

                                                        setValue(
                                                            Form.ResolutionDate,
                                                            luxonDate.setZone(
                                                                e.target.value,
                                                            ),
                                                        );

                                                        field.onChange(e);
                                                    }}
                                                >
                                                    {timezones.map((tz) => (
                                                        <MenuItem
                                                            value={tz}
                                                            key={tz}
                                                        >
                                                            {tz}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                            <Controller
                                control={control}
                                name={Form.HasNoResolutionDate}
                                render={({ field }) => (
                                    <>
                                        <FormControlLabel
                                            className={styles.checkbox_label}
                                            control={
                                                <Checkbox
                                                    className={styles.checkbox}
                                                    checked={
                                                        field.value === true
                                                    }
                                                    onChange={() => {
                                                        setValue(
                                                            Form.HasNoResolutionDate,
                                                            !field.value,
                                                        );
                                                    }}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Heebo16Black400>
                                                    Market does not have
                                                    resolution date
                                                </Heebo16Black400>
                                            }
                                        />
                                        <ErrorComponent
                                            formKey={Form.ResolutionDate}
                                            errors={errors}
                                        />
                                    </>
                                )}
                            />
                        </MarketSectionWrapper>
                        <MarketSectionWrapper sectionTitle="Description">
                            <Controller
                                control={control}
                                name={Form.Description}
                                render={({ field }) => (
                                    <>
                                        <TextField
                                            className={styles.input}
                                            type="text"
                                            variant="outlined"
                                            placeholder="Describe how the resolution will be resolved under different scenarios"
                                            fullWidth
                                            multiline
                                            rows={6}
                                            error={hasError(
                                                Form.Description,
                                                errors,
                                            )}
                                            {...field}
                                        />
                                        <ErrorComponent
                                            formKey={Form.Description}
                                            errors={errors}
                                        />
                                    </>
                                )}
                            />
                        </MarketSectionWrapper>
                        <MarketSectionWrapper sectionTitle="Resolution Source">
                            <Controller
                                control={control}
                                name={Form.ResolutionSource}
                                render={({ field }) => (
                                    <>
                                        <TextField
                                            className={styles.input}
                                            type="text"
                                            variant="outlined"
                                            fullWidth
                                            placeholder="Enter resolution source"
                                            error={hasError(
                                                Form.ResolutionSource,
                                                errors,
                                            )}
                                            {...field}
                                        />
                                        <ErrorComponent
                                            formKey={Form.ResolutionSource}
                                            errors={errors}
                                        />
                                    </>
                                )}
                            />
                        </MarketSectionWrapper>
                        <MarketSectionWrapper sectionTitle="Oracle" isBottom>
                            <Heebo16Black400>
                                This resolution address is set to Polymarket’s
                                MIC by default.
                            </Heebo16Black400>
                            <Heebo16Blue500>
                                <a
                                    href="todo-fill-in-github"
                                    className={externalLinkStyles.link_base}
                                >
                                    Verify on Github
                                </a>
                            </Heebo16Blue500>
                            <Controller
                                control={control}
                                name={Form.Oracle}
                                render={({ field }) => (
                                    <>
                                        <TextField
                                            className={styles.input}
                                            type="text"
                                            variant="outlined"
                                            placeholder="0x123"
                                            fullWidth
                                            error={hasError(
                                                Form.Oracle,
                                                errors,
                                            )}
                                            {...field}
                                        />
                                        <ErrorComponent
                                            formKey={Form.Oracle}
                                            errors={errors}
                                        />
                                    </>
                                )}
                            />
                            <div className={styles.ctaButton_wrapper}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={
                                        !isDirty ||
                                        Object.keys(errors).length > 0
                                    }
                                    className={buttonStyles.wideButton}
                                >
                                    Next
                                </Button>
                            </div>
                        </MarketSectionWrapper>
                    </form>
                ) : (
                    <>
                        <DetailHeader
                            title="Update Market"
                            onClick={() => setFormState(FormState.Create)}
                        />
                        <div className={styles.review_wrapper}>
                            <MetaDataList metaData={valuesToReview} />
                        </div>
                        <div className={styles.ctaButton_wrapper}>
                            {txState === TxState.Initial ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    onClick={handleSubmit(handleSubmitToSdk)}
                                    className={buttonStyles.wideButton}
                                >
                                    Propose
                                </Button>
                            ) : null}
                            {txState === TxState.Submitting ? (
                                <ButtonTxLoading btnText="Proposal loading..." />
                            ) : null}
                            {txState === TxState.Success ? (
                                <ButtonTxSuccess
                                    btnText="Success!"
                                    txUrl={txExplorerUrl}
                                />
                            ) : null}
                            {txState === TxState.Failure ? (
                                <ButtonTxFail />
                            ) : null}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default CreateMarket;