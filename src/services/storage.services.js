import { MMKV } from "react-native-mmkv";

export const storage = new MMKV(
    {
        id: "user-storage",
        encryptionKey: "secure-key-is-sasa"
    }
)

export const mmkvstorage = {
    setItem: (key, value) => {
        storage.set(key, value);
    },
    getItem:(key)=>{
        const value = storage.getString(key)
        return value ?? null;
    }
    ,
    removeItem: (key) => {
        storage.delete(key);
    }

}