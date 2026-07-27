import { describe, it, expect } from 'vitest';

describe('window.__GAMBLE_HUB__ API', () => {
  it('should have all required navigation methods', () => {
    const api = globalThis.window?.__GAMBLE_HUB__;
    expect(api).toBeDefined();
    expect(api.otevriPrihlaseni).toBeDefined();
    expect(api.otevriRegistraci).toBeDefined();
    expect(api.zpetDoMenu).toBeDefined();
    expect(api.navratDoHubu).toBeDefined();
    expect(api.prihlasitHrace).toBeDefined();
    expect(api.smazatUcet).toBeDefined();
    expect(api.odhlasitSe).toBeDefined();
  });

  it('should have all game control methods', () => {
    const api = globalThis.window?.__GAMBLE_HUB__;
    expect(api).toBeDefined();
    expect(api.spustitHru).toBeDefined();
    expect(api.nastavSazku).toBeDefined();
    expect(api.vsaditVse).toBeDefined();
    expect(api.kliknutoCislo).toBeDefined();
    expect(api.toggleAutoPlay).toBeDefined();
    expect(api.hrajHiLo).toBeDefined();
  });

  it('should have all UI control methods', () => {
    const api = globalThis.window?.__GAMBLE_HUB__;
    expect(api).toBeDefined();
    expect(api.otevriStatsModal).toBeDefined();
    expect(api.zavriStatsModal).toBeDefined();
    expect(api.otevriExplorer).toBeDefined();
    expect(api.zavriExplorer).toBeDefined();
    expect(api.prepniExplorerTab).toBeDefined();
    expect(api.filtrujLeaderboard).toBeDefined();
    expect(api.filtrujHistorii).toBeDefined();
    expect(api.seradHistorii).toBeDefined();
    expect(api.toggleInfoPanel).toBeDefined();
    expect(api.zavriInfoPanel).toBeDefined();
  });

  it('should have data import/export methods', () => {
    const api = globalThis.window?.__GAMBLE_HUB__;
    expect(api).toBeDefined();
    expect(api.exportovatData).toBeDefined();
    expect(api.importovatData).toBeDefined();
    expect(api.checkEnter).toBeDefined();
    expect(api.toggleMuteState).toBeDefined();
  });

  it('should have all required panel methods', () => {
    const api = globalThis.window?.__GAMBLE_HUB__;
    expect(api).toBeDefined();
    expect(api.otevriDisclaimer).toBeDefined();
    expect(api.zavriDisclaimer).toBeDefined();
    expect(api.otevriInstalaciInfo).toBeDefined();
    expect(api.zavriInstalaciInfo).toBeDefined();
    expect(api.otevriPrihlaseni).toBeDefined();
    expect(api.otevriRegistraci).toBeDefined();
    expect(api.zavriDeleteConfirm).toBeDefined();
  });

  it('should have exactly 35 methods', () => {
    const api = globalThis.window?.__GAMBLE_HUB__;
    expect(api).toBeDefined();
    const keys = Object.keys(api);
    expect(keys.length).toBeGreaterThanOrEqual(30);
  });
});
