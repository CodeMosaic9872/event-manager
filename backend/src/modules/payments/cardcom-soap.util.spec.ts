import { escapeXml, getXmlInnerText, getXmlBlock } from './cardcom-soap.util';

describe('cardcom-soap.util', () => {
  it('escapeXml escapes special characters', () => {
    expect(escapeXml(`a&b<c>"'`)).toBe('a&amp;b&lt;c&gt;&quot;&apos;');
  });

  it('getXmlInnerText reads first tag', () => {
    const xml = '<ResponseCode>0</ResponseCode><Description>OK</Description>';
    expect(getXmlInnerText(xml, 'ResponseCode')).toBe('0');
  });

  it('getXmlBlock extracts nested section', () => {
    const xml = '<root><Indicator><Token>t1</Token></Indicator></root>';
    const block = getXmlBlock(xml, 'Indicator');
    expect(block).toContain('<Token>t1</Token>');
  });
});
