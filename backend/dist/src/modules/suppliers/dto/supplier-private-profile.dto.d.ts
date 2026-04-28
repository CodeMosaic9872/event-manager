export declare class AddSupplierMediaDto {
    mediaType: string;
    url: string;
    sortOrder?: number;
    metadataJson?: Record<string, unknown>;
}
export declare class UpdateSupplierAttributesDto {
    insurance?: boolean;
    accessibility?: boolean;
    kosherOptions?: unknown;
    languagesJson?: unknown;
    workingDaysJson?: unknown;
    certificationsJson?: unknown;
}
export declare class ServiceAreaItemDto {
    regionCode: string;
    cityCode?: string;
}
export declare class UpdateSupplierServiceAreasDto {
    serviceAreas: ServiceAreaItemDto[];
}
