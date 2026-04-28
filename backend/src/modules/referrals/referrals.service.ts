import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class ReferralsService {
  getLink(supplierId: string) {
    return {
      supplierId,
      code: `ref_${supplierId}`,
      url: `https://event-marketplace.example/ref/${supplierId}`,
    };
  }

  regenerateLink(supplierId: string) {
    const code = `ref_${randomBytes(4).toString('hex')}`;
    return {
      supplierId,
      code,
      url: `https://event-marketplace.example/ref/${code}`,
    };
  }

  listAttributions(supplierId: string) {
    return { supplierId, attributions: [] };
  }

  listRewards(supplierId: string) {
    return { supplierId, rewards: [] };
  }
}
