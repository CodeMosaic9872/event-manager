import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * OpenAPI schema for `POST /supplier/media/upload/gallery` (multipart, field `files` repeated or array).
 * Runtime fields besides `files` are parsed with {@link UploadSupplierMediaFilesFormDto}.
 */
export class SupplierMediaUploadFilesMultipartDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'One or more files. Max **24** parts, **20 MB** each. Form field name must be `files`.',
  })
  files!: unknown[];

  @ApiPropertyOptional({
    description:
      'Supplier id — **required** without Bearer (onboarding). With **SUPPLIER** Bearer, must match the caller’s supplier. With **ADMIN** Bearer, targets this supplier (admin add-supplier flow).',
    example: 'sup_abc123',
  })
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'Stored on each `SupplierMedia.mediaType`. Use `gallery` for marketplace gallery. Defaults to `image`.',
    example: 'gallery',
    default: 'image',
  })
  mediaType?: string;

  @ApiPropertyOptional({
    description: 'Starting `sortOrder` for the first file; subsequent files increment by 1.',
    example: '0',
  })
  sortOrder?: string;
}
