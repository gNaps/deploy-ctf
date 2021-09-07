export interface Market {
    id: number;
    question: string;
    conditionId: ConditionId;
    slug: string;
    twitter_card_image: string;
    resolution_source: string | null;
    end_date: string;
    category: string;
    subcategory?: string;
    amm_type: null;
    liquidity: string;
    sponsor_name: string | null;
    sponsor_image: string | null;
    start_date: string | null;
    x_axis_value: null;
    y_axis_value: null;
    denomination_token: null;
    fee: string;
    image: string;
    icon: string;
    submitted_by: string;
    upper_bound: string | null;
    lower_bound: string | null;
    description: string;
    tags: string[];
    outcomes: string[];
    outcomePrices: string[];
    volume: string;
    active: boolean;
    market_type: "normal" | "scalar" | null;
    format_type:
        | "normal"
        | "decimal"
        | "date"
        | "number"
        | "percent"
        | "eth"
        | null;
    lower_bound_date: null;
    upper_bound_date: null;
    closed: boolean | null;
    marketMakerAddress: string;
    created_at: timestamp;
    updated_at: timestamp;
    closed_time: timestamp;
    wide_format: boolean | null;
    new: boolean | null;

    use_cases: UseCase[];

    seo: Seo;
    featured: boolean | null;
}
export type StrapiMarketsPostResponse = Market;
