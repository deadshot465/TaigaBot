interface IUrl {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
}

interface ILink {
    self: string;
    html: string;
    download: string;
    download_location: string;
}

interface IUnsplashQueryResult {
    id: string;
    created_at: string;
    updated_at: string;
    promoted_at: any;
    width: number;
    height: number;
    color: string;
    description: string;
    alt_description: string;
    urls: IUrl;
    links: ILink;
    categories: string[];
    likes: number;
    liked_by_user: boolean;
    current_user_collections: string[];
    user: any;
    tags: any[];
}

export default interface IUnsplashSearchResult {
    total: number;
    total_pages: number;
    results: IUnsplashQueryResult[];
}