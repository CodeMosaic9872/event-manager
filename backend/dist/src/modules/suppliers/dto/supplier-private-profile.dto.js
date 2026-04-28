"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSupplierServiceAreasDto = exports.ServiceAreaItemDto = exports.UpdateSupplierAttributesDto = exports.AddSupplierMediaDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class AddSupplierMediaDto {
}
exports.AddSupplierMediaDto = AddSupplierMediaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], AddSupplierMediaDto.prototype, "mediaType", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], AddSupplierMediaDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AddSupplierMediaDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AddSupplierMediaDto.prototype, "metadataJson", void 0);
class UpdateSupplierAttributesDto {
}
exports.UpdateSupplierAttributesDto = UpdateSupplierAttributesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSupplierAttributesDto.prototype, "insurance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSupplierAttributesDto.prototype, "accessibility", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateSupplierAttributesDto.prototype, "kosherOptions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateSupplierAttributesDto.prototype, "languagesJson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateSupplierAttributesDto.prototype, "workingDaysJson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateSupplierAttributesDto.prototype, "certificationsJson", void 0);
class ServiceAreaItemDto {
}
exports.ServiceAreaItemDto = ServiceAreaItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(32),
    __metadata("design:type", String)
], ServiceAreaItemDto.prototype, "regionCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(32),
    __metadata("design:type", String)
], ServiceAreaItemDto.prototype, "cityCode", void 0);
class UpdateSupplierServiceAreasDto {
}
exports.UpdateSupplierServiceAreasDto = UpdateSupplierServiceAreasDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ServiceAreaItemDto),
    __metadata("design:type", Array)
], UpdateSupplierServiceAreasDto.prototype, "serviceAreas", void 0);
//# sourceMappingURL=supplier-private-profile.dto.js.map