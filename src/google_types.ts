export interface Root {
    reviews: Review[];
    tokenPagination?: tokenPagination;
}

export interface Review {
    reviewId:   string;
    authorName: string;
    comments:   Comment[];
}

export interface Comment {
    userComment?:      UserComment;
    developerComment?: DeveloperComment;
}

export interface DeveloperComment {
    text:         string;
    lastModified: LastModified;
}

export interface LastModified {
    seconds: string;
    nanos:   number;
}

export interface UserComment {
    text:             string;
    lastModified:     LastModified;
    starRating:       number;
    reviewerLanguage: ReviewerLanguage;
    device:           string;
    androidOsVersion: number;
    appVersionCode?:  number;
    appVersionName?:  AppVersionName;
    deviceMetadata:   DeviceMetadata;
    thumbsDownCount?: number;
}

export enum AppVersionName {
    The11030 = "1.103.0",
}

export interface DeviceMetadata {
    productName:      string;
    manufacturer:     string;
    deviceClass:      DeviceClass;
    screenWidthPx:    number;
    screenHeightPx:   number;
    nativePlatform:   NativePlatform;
    screenDensityDpi: number;
    glEsVersion:      number;
    ramMb:            number;
}

export enum DeviceClass {
    FormFactorPhone = "FORM_FACTOR_PHONE",
    FormFactorTablet = "FORM_FACTOR_TABLET",
}

export enum NativePlatform {
    ABIArm64V8 = "ABI_ARM64_V8",
    ABIArm64V8ABIArmV7ABIArm = "ABI_ARM64_V8,ABI_ARM_V7,ABI_ARM",
    ABIArmV7ABIArm = "ABI_ARM_V7,ABI_ARM",
}

export enum ReviewerLanguage {
    Ar = "ar",
    En = "en",
    Es = "es",
    Fr = "fr",
}

export interface tokenPagination {
    nextPageToken: string;
    previousPageToken: string;
}
