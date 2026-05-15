import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { getXmlBlock, getXmlInnerText } from '../cardcom-soap.util';
import type {
  CardcomCreateLowProfileParams,
  CardcomCreateLowProfileResult,
  CardcomGetLowProfileIndicatorResult,
  CardcomIndicatorParsed,
} from './cardcom.types';

const XSI = 'http://www.w3.org/2001/XMLSchema-instance';

function buildCreateLowProfileEnvelope(p: CardcomCreateLowProfileParams): string {
  const invoiceHeadXml =
    p.invoiceCustName || p.invoiceEmail
      ? `<InvoiceHead>
          ${p.invoiceCustName ? `<CustName>${escapeXmlStrict(p.invoiceCustName)}</CustName>` : ''}
          ${p.invoiceEmail ? `<Email>${escapeXmlStrict(p.invoiceEmail)}</Email>` : ''}
        </InvoiceHead>`
      : '';

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="${XSI}" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CreateLowProfileDeal xmlns="BillGoldService">
      <terminalnumber>${p.terminalNumber}</terminalnumber>
      <username>${escapeXmlStrict(p.username)}</username>
      <lowprofileParams>
        <Operation>${p.operation}</Operation>
        <ReturnValue>${escapeXmlStrict(p.returnValue)}</ReturnValue>
        <SumToBill>${escapeXmlStrict(p.sumToBill)}</SumToBill>
        <Language>${escapeXmlStrict(p.language)}</Language>
        <Languge>${escapeXmlStrict(p.language)}</Languge>
        <SuccessRedirectUrl>${escapeXmlStrict(p.successRedirectUrl)}</SuccessRedirectUrl>
        <ErrorRedirectUrl>${escapeXmlStrict(p.errorRedirectUrl)}</ErrorRedirectUrl>
        <IndicatorUrl>${escapeXmlStrict(p.indicatorUrl)}</IndicatorUrl>
        <CancelUrl>${escapeXmlStrict(p.cancelUrl)}</CancelUrl>
        <HideCreditCardUserId>false</HideCreditCardUserId>
        <HideCVV>false</HideCVV>
        <CreateTokenDeleteDate xsi:nil="true"/>
        <CreateTokenJValidateType xsi:nil="true"/>
        <SuspendedDealJValidateType xsi:nil="true"/>
        <SuspendedDealGroup xsi:nil="true"/>
        <IsCreateInvoice>${p.isCreateInvoice ? 'true' : 'false'}</IsCreateInvoice>
        ${invoiceHeadXml}
        ${p.productName ? `<ProductName>${escapeXmlStrict(p.productName)}</ProductName>` : ''}
        ${p.token ? `<Token>${escapeXmlStrict(p.token)}</Token>` : ''}
        <MaxNumOfPayments xsi:nil="true"/>
        <MinNumOfPayments xsi:nil="true"/>
        <CoinID xsi:nil="true"/>
        <ThreeDSecureState>Auto</ThreeDSecureState>
        <DeferMonths xsi:nil="true"/>
      </lowprofileParams>
      <UserID>${p.billGoldUserId}</UserID>
    </CreateLowProfileDeal>
  </soap:Body>
</soap:Envelope>`;
}

function buildGetLowProfileIndicatorEnvelope(terminalNumber: number, username: string, lowProfileCode: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="${XSI}" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetLowProfileIndicator xmlns="BillGoldService">
      <terminalnumber>${terminalNumber}</terminalnumber>
      <username>${escapeXmlStrict(username)}</username>
      <lowProfileCode>${escapeXmlStrict(lowProfileCode)}</lowProfileCode>
    </GetLowProfileIndicator>
  </soap:Body>
</soap:Envelope>`;
}

function escapeXmlStrict(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseCreateLowProfileResult(xml: string): CardcomCreateLowProfileResult {
  const block = getXmlBlock(xml, 'CreateLowProfileDealResult') ?? getXmlBlock(xml, 'CreateLowProfileDealResponse') ?? xml;
  const responseCode = Number.parseInt(getXmlInnerText(block, 'ResponseCode') ?? '999999', 10);
  return {
    responseCode: Number.isFinite(responseCode) ? responseCode : 999999,
    description: getXmlInnerText(block, 'Description'),
    lowProfileCode: getXmlInnerText(block, 'LowProfileCode'),
    lowProfileVersion: parseOptionalInt(getXmlInnerText(block, 'LowProfileVersion')),
    baseUrl: getXmlInnerText(block, 'BaseUrl'),
    urlPath: getXmlInnerText(block, 'url'),
  };
}

function parseOptionalInt(v: string | null): number | null {
  if (v === null) return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function parseIndicatorBlock(block: string): CardcomIndicatorParsed {
  const dealResp =
    getXmlInnerText(block, 'DealRespone') ?? getXmlInnerText(block, 'DealResponse') ?? getXmlInnerText(block, 'dealRespone');
  const prosses = getXmlInnerText(block, 'ProssesEndOK');
  const revoked = getXmlInnerText(block, 'IsRevoked');
  return {
    returnValue: getXmlInnerText(block, 'ReturnValue'),
    lowProfileCode: getXmlInnerText(block, 'lowprofilecode') ?? getXmlInnerText(block, 'LowProfileCode'),
    internalDealNumber: getXmlInnerText(block, 'InternalDealNumber'),
    token: getXmlInnerText(block, 'Token'),
    tokenExDate: getXmlInnerText(block, 'TokenExDate'),
    prossesEndOK: prosses !== null ? Number.parseInt(prosses, 10) : null,
    dealRespone: dealResp !== null ? Number.parseInt(dealResp, 10) : null,
    isRevoked: revoked === null ? null : revoked.toLowerCase() === 'true',
  };
}

function parseGetLowProfileIndicatorResult(xml: string): CardcomGetLowProfileIndicatorResult {
  const block = getXmlBlock(xml, 'GetLowProfileIndicatorResult') ?? xml;
  const responseCode = Number.parseInt(getXmlInnerText(block, 'ResponseCode') ?? '999999', 10);
  const indicatorXml = getXmlBlock(block, 'Indicator');
  return {
    responseCode: Number.isFinite(responseCode) ? responseCode : 999999,
    description: getXmlInnerText(block, 'Description'),
    indicator: indicatorXml ? parseIndicatorBlock(indicatorXml) : null,
  };
}

@Injectable()
export class CardcomClient {
  private soapUrl(): string {
    return process.env.CARDCOM_SOAP_URL ?? 'https://secure.cardcom.solutions/Interface/BillGoldService.asmx';
  }

  private timeoutMs(): number {
    const raw = process.env.CARDCOM_HTTP_TIMEOUT_MS;
    const n = raw ? Number.parseInt(raw, 10) : 20000;
    return Number.isFinite(n) && n > 0 ? n : 20000;
  }

  async createLowProfileDeal(params: CardcomCreateLowProfileParams): Promise<CardcomCreateLowProfileResult> {
    const body = buildCreateLowProfileEnvelope(params);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs());
    try {
      const res = await fetch(this.soapUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: 'BillGoldService/CreateLowProfileDeal',
        },
        body,
        signal: controller.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        throw new ServiceUnavailableException(`CardCom HTTP ${res.status}`);
      }
      return parseCreateLowProfileResult(text);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new ServiceUnavailableException('CardCom request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async getLowProfileIndicator(
    terminalNumber: number,
    username: string,
    lowProfileCode: string,
  ): Promise<CardcomGetLowProfileIndicatorResult> {
    const body = buildGetLowProfileIndicatorEnvelope(terminalNumber, username, lowProfileCode);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs());
    try {
      const res = await fetch(this.soapUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: 'BillGoldService/GetLowProfileIndicator',
        },
        body,
        signal: controller.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        throw new ServiceUnavailableException(`CardCom HTTP ${res.status}`);
      }
      return parseGetLowProfileIndicatorResult(text);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new ServiceUnavailableException('CardCom request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

/** CardCom success code for SOAP operations (per integration guides). */
export function isCardcomSoapOk(responseCode: number): boolean {
  return responseCode === 0;
}
