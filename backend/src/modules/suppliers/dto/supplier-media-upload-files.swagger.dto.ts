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
      'Supplier id — **required** when the request has no `Authorization: Bearer` (onboarding). Ignored or must match the authenticated supplier when Bearer is present.',
  })
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'Stored on each `SupplierMedia.mediaType`. Defaults to `image`.',
    example: 'image',
    default: 'image',
  })
  mediaType?: string;

  @ApiPropertyOptional({
    description: 'Starting `sortOrder` for the first file; subsequent files increment by 1.',
    example: '0',
  })
  sortOrder?: string;
}
