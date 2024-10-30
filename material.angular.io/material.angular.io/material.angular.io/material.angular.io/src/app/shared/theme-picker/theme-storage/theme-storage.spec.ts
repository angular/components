import {ThemeStorage, DocsSiteTheme} from './theme-storage';


const testStorageKey = ThemeStorage.storageKey;
const testTheme: DocsSiteTheme = {
  color: '#000000',
  background: '#ffffff',
  name: 'test-theme'
};

describe('ThemeStorage Service', () => {
  const service = new ThemeStorage();
  const getCurrTheme = () => window.localStorage.getItem(testStorageKey);
  const secondTestTheme: DocsSiteTheme = {
    color: '#666666',
    background: '#333333',
    name: 'other-test-theme'
  };

  beforeEach(() => {
    window.localStorage[testStorageKey] = testTheme.name;
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('should set the current theme name', () => {
    expect(getCurrTheme()).toEqual(testTheme.name);
    service.storeTheme(secondTestTheme);
    expect(getCurrTheme()).toEqual(secondTestTheme.name);
  });

  it('should get the current theme name', () => {
    const theme = service.getStoredThemeName();
    expect(theme).toEqual(testTheme.name);
  });

  it('should clear the stored theme data', () => {
    expect(getCurrTheme()).not.toBeNull();
    service.clearStorage();
    expect(getCurrTheme()).toBeNull();
  });

  it('should emit an event when setTheme is called', () => {
    spyOn(service.onThemeUpdate, 'emit');
    service.storeTheme(secondTestTheme);
    expect(service.onThemeUpdate.emit).toHaveBeenCalled();
    expect(service.onThemeUpdate.emit).toHaveBeenCalledWith(secondTestTheme);
  });
});
