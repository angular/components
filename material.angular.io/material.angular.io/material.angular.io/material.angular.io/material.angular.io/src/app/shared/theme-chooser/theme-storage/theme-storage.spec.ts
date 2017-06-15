import {ThemeStorage} from './theme-storage';


const testStorageKey = ThemeStorage.storageKey;
const testTheme = {
  primary: '#000000',
  accent: '#ffffff',
  href: 'test/path/to/theme'
};
const createTestData = () => {
  window.localStorage[testStorageKey] = JSON.stringify(testTheme);
};
const clearTestData = () => {
  window.localStorage.clear();
};

describe('ThemeStorage Service', () => {
  const service = new ThemeStorage();
  const getCurrTheme = () => JSON.parse(window.localStorage.getItem(testStorageKey));
  const secondTestTheme = {
    primary: '#666666',
    accent: '#333333',
    href: 'some/cool/path'
  };

  beforeEach(createTestData);
  afterEach(clearTestData);

  it('should set the current theme', () => {
    expect(getCurrTheme()).toEqual(testTheme);
    service.storeTheme(secondTestTheme);
    expect(getCurrTheme()).toEqual(secondTestTheme);
  });

  it('should get the current theme', () => {
    const theme = service.getStoredTheme();
    expect(theme).toEqual(testTheme);
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
