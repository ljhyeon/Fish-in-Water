import { create } from 'zustand';

const userStore = create((set) => ({
    name: '',
    setName: (name) => set({ name }),
}));

export default userStore;
