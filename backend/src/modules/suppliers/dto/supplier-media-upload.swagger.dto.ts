import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * OpenAPI schema for `POST /supplier/media/upload-file` (multipart/form-data).
 * The runtime body is parsed with {@link UploadSupplierMediaFileDto} + multer `file` field.
 */
export class SupplierMediaUploadFileMultipartDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Binary file (images or small documents). Max 20 MB. Form field name must be `file`.',
  })
  file!: unknown;

  @ApiPropertyOptional({
    description:
      'Supplier id — **required** when the request has no `Authorization: Bearer` (e.g. onboarding). Ignored or must match the authenticated supplier when Bearer is present.',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'Stored on `SupplierMedia.mediaType`. Defaults to `image`.',
    example: 'image',
    default: 'image',
  })
  mediaType?: string;

  @ApiPropertyOptional({
    description: 'Gallery sort order, sent as a string in multipart (e.g. `"0"`). Parsed as integer.',
    example: '0',
  })
  sortOrder?: string;

  @ApiPropertyOptional({
    description:
      'Multipart boolean: `true`, `false`, `1`, or `0`. When true, also writes the uploaded public URL to `supplier.kosher`.',
    example: 'false',
  })
  attachKosher?: string;

  @ApiPropertyOptional({
    description:
      'Multipart boolean: `true`, `false`, `1`, or `0`. When true, also writes the uploaded public URL to `supplier.form_3010` (form 3010).',
    example: 'false',
  })
  attachForm3010?: string;
}
