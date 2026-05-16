import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SupplierListItemDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: 'Skyline Events DJ' })
  businessName!: string;

  @ApiProperty({ example: 4.8 })
  ratingAvg!: number;

  @ApiPropertyOptional({ nullable: true })
  avatarImageUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  coverImageUrl!: string | null;
}

export class SupplierSuggestionItemDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: 'Skyline Events DJ' })
  label!: string;

  @ApiProperty({ example: 'supplier' })
  type!: string;

  @ApiProperty({ example: 'skyline-events-dj' })
  value!: string;
}

export class SupplierSuggestionsListResponseDto {
  @ApiProperty({ type: [SupplierSuggestionItemDto] })
  items!: SupplierSuggestionItemDto[];

  @ApiProperty()
  totalItems!: number;
}

export class PaginatedFavoriteSuppliersResponseDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  items!: Record<string, unknown>[];

  @ApiProperty()
  totalItems!: number;
}

export class SuppliersListResponseDto {
  @ApiProperty({ type: [SupplierListItemDto] })
  items!: SupplierListItemDto[];

  @ApiProperty({ example: 'sup_1', nullable: true })
  nextCursor!: string | null;

  @ApiProperty({ example: { categories: [{ id: 'cat_1', name: 'Music', count: 12 }] } })
  facets!: Record<string, unknown>;
}

export class SupplierSimilarItemDto {
  @ApiProperty({ example: 'sup_2' })
  id!: string;

  @ApiProperty({ example: 'Tel Aviv Sounds' })
  businessName!: string;

  @ApiPropertyOptional({ nullable: true, example: 4.6 })
  ratingAvg!: number | null;

  @ApiPropertyOptional({ nullable: true })
  avatarImageUrl!: string | null;
}

export class SupplierPublicSocialLinkDto {
  @ApiProperty({ example: 'instagram' })
  platform!: string;

  @ApiProperty({ example: 'https://instagram.com/skylineevents' })
  url!: string;
}

export class SupplierProfileResponseDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: 'skyline-events-dj' })
  slug!: string;

  @ApiProperty({ example: 'Skyline Events DJ' })
  businessName!: string;

  @ApiProperty({ example: 'Premium DJ and MC services for weddings and private events.' })
  description!: string;

  @ApiPropertyOptional({ nullable: true, example: 'hello@skylineevents.co.il' })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Music & DJ' })
  category!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Wedding DJ' })
  subcategory!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Tel Aviv' })
  city!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 4.8 })
  ratingAvg!: number | null;

  @ApiProperty({ example: 42, description: 'Same value as supplier `ratingCount` (approved reviews aggregate).' })
  reviewCount!: number;

  @ApiPropertyOptional({ nullable: true, example: '0501234567' })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  whatsapp!: string | null;

  @ApiPropertyOptional({ nullable: true })
  website!: string | null;

  @ApiPropertyOptional({ nullable: true })
  instagram!: string | null;

  @ApiPropertyOptional({ nullable: true })
  facebook!: string | null;

  @ApiPropertyOptional({ nullable: true })
  avatarImageUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  coverImageUrl!: string | null;

  @ApiProperty({ type: [String], example: ['https://cdn.example.com/suppliers/sup_1/gallery/1.jpg'] })
  gallery!: string[];

  @ApiPropertyOptional({ nullable: true })
  kosher!: string | null;

  @ApiPropertyOptional({ nullable: true })
  form3010!: string | null;

  @ApiProperty({ type: [SupplierPublicSocialLinkDto] })
  socialLinks!: SupplierPublicSocialLinkDto[];

  @ApiProperty({ type: [String], example: ['Dairy catering', 'Workshops'] })
  subcategories!: string[];

  @ApiProperty({ type: [String], example: ['Jerusalem', 'North'] })
  serviceAreas!: string[];

  @ApiProperty({ type: [String], example: ['Reserved', 'Ministry of Defense Supplier'] })
  labelsRules!: string[];

  @ApiProperty({ type: [String], example: ['vegan', 'Meat catering'] })
  labelsNiche!: string[];

  @ApiPropertyOptional({ nullable: true })
  address!: string | null;

  @ApiPropertyOptional({ nullable: true })
  extraLanguage!: string | null;

  @ApiProperty({ type: [SupplierSimilarItemDto] })
  similar!: SupplierSimilarItemDto[];
}

export class ShareTrackResponseDto {
  @ApiProperty({ example: 'share_123' })
  id!: string;

  @ApiProperty({ example: 'sup_1' })
  supplierId!: string;

  @ApiProperty({ example: 'copy_link' })
  channel!: string;

  @ApiProperty({ example: 'supplier_profile_header' })
  context!: string;
}

export class SupplierDraftResponseDto {
  @ApiProperty({ example: 'draft_1' })
  id!: string;

  @ApiProperty({ example: 'sup_1' })
  supplierId!: string;

  @ApiProperty({ example: 'service_areas' })
  stepKey!: string;

  @ApiProperty({ example: 45 })
  completionPercent!: number;

  @ApiProperty({ example: { serviceAreas: ['north', 'jerusalem'] } })
  payloadJson!: Record<string, unknown>;

  @ApiProperty({ example: 2 })
  version!: number;
}

/** Single gallery / document row on a supplier profile. */
export class SupplierMediaResponseDto {
  @ApiProperty({ example: 'smed_2k3j4h5g6f7d8s9' })
  id!: string;

  @ApiProperty({ example: 'sup_1' })
  supplierId!: string;

  @ApiProperty({ example: 'image', description: 'Arbitrary media type label (e.g. image, video, pdf).' })
  mediaType!: string;

  @ApiProperty({
    example: 'https://cdn.example.com/suppliers/sup_1/uuid-photo.jpg',
    description: 'Public CDN URL after direct upload or complete-upload flow.',
  })
  url!: string;

  @ApiProperty({ example: 0, description: 'Sort order within the supplier gallery.' })
  sortOrder!: number;

  @ApiPropertyOptional({
    description: 'Optional JSON metadata from add-media or complete-upload.',
    type: Object,
  })
  metadataJson?: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-05-12T12:00:00.000Z', type: String })
  createdAt!: Date;
}

/** Response from `POST /supplier/media/upload-url` (presigned PUT to Spaces). */
export class SupplierMediaPresignedUploadResponseDto {
  @ApiProperty({ example: 'suppliers/sup_1/550e8400-e29b-41d4-a716-446655440000-cover.jpg' })
  key!: string;

  @ApiProperty({
    description: 'Time-limited signed URL for HTTP PUT of the file bytes (DigitalOcean Spaces / S3-compatible).',
    example: 'https://fra1.digitaloceanspaces.com/bucket/suppliers/...?X-Amz-Algorithm=...',
  })
  uploadUrl!: string;

  @ApiProperty({
    description: 'Stable public URL after the object is successfully uploaded (same key as above).',
    example: 'https://event-marketplace-media.fra1.cdn.digitaloceanspaces.com/suppliers/sup_1/550e8400-....jpg',
  })
  publicUrl!: string;

  @ApiProperty({ example: 600, description: 'Signed PUT lifetime in seconds (typically 10 minutes).' })
  expiresInSeconds!: number;
}

/** Response from `POST /supplier/media/verify-upload` after HEAD on the object. */
export class SupplierMediaVerifyUploadResponseDto {
  @ApiProperty({ example: true, description: 'True when the object exists and belongs to the supplier prefix.' })
  exists!: boolean;

  @ApiProperty({ example: 'suppliers/sup_1/550e8400-e29b-41d4-a716-446655440000-cover.jpg' })
  key!: string;

  @ApiProperty({ example: 'https://cdn.example.com/suppliers/sup_1/550e8400-....jpg' })
  publicUrl!: string;

  @ApiProperty({ example: 245678, description: 'Object size in bytes from storage HEAD.' })
  contentLength!: number;

  @ApiPropertyOptional({ nullable: true, example: 'image/jpeg', description: 'Content-Type from object metadata.' })
  contentType!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '"d41d8cd98f00b204e9800998ecf8427e"', description: 'ETag from storage.' })
  etag!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    example: '2026-05-12T12:00:00.000Z',
    description: 'Last-Modified from storage.',
  })
  lastModified!: Date | null;
}

/** Response from `DELETE /supplier/media/:id`. */
export class SupplierMediaDeleteResponseDto {
  @ApiProperty({ example: true })
  deleted!: boolean;

  @ApiProperty({ example: 'smed_2k3j4h5g6f7d8s9' })
  id!: string;
}

/** Response from `POST /supplier/media/upload/gallery` (multipart, multiple `files`). */
export class SupplierMediaBatchUploadResponseDto {
  @ApiProperty({ type: [SupplierMediaResponseDto] })
  items!: SupplierMediaResponseDto[];

  @ApiProperty({ example: 3, description: 'Number of `SupplierMedia` rows created' })
  count!: number;
}

/** Response from `POST /supplier/media/delete-batch`. */
export class SupplierMediaBatchDeleteResponseDto {
  @ApiProperty({ example: 2, description: 'Number of rows deleted' })
  deleted!: number;

  @ApiProperty({
    type: [String],
    description: 'Ids that existed and were deleted (subset of the request when some ids were invalid or not owned)',
  })
  ids!: string[];
}
