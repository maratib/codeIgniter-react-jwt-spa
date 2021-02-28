
// Getter functions
const getItem = (itemName: string) => localStorage.getItem(itemName);

const saveItem = (itemName: string, itemValue: string) => {
    localStorage.setItem(itemName, itemValue);
};

// Loader functions
export const loadUser = () => JSON.parse(getItem('user') || '{}');
export const loadJWT = () => getItem('token');

// Storage functions
export const saveUser = (user: any) => {
    saveItem('user', JSON.stringify(user));
};

export const saveJWT = (token: string) => {
    saveItem('token', token);
};

export const clearState = () => {
	localStorage.clear();
}