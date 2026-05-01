import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type MarketplaceState = {
  searchTerm: string;
  selectedEventType: string;
  selectedCategory: string;
  selectedSubcategory: string;
  locationRegionCode: string;
  minRating: number;
  favorites: string[];
};

const initialState: MarketplaceState = {
  searchTerm: "",
  selectedEventType: "חתונה",
  selectedCategory: "",
  selectedSubcategory: "",
  locationRegionCode: "",
  minRating: 0,
  favorites: [],
};

const marketplaceSlice = createSlice({
  name: "marketplace",
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedEventType: (state, action: PayloadAction<string>) => {
      state.selectedEventType = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedSubcategory: (state, action: PayloadAction<string>) => {
      state.selectedSubcategory = action.payload;
    },
    setLocationRegionCode: (state, action: PayloadAction<string>) => {
      state.locationRegionCode = action.payload;
    },
    setMinRating: (state, action: PayloadAction<number>) => {
      state.minRating = action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      if (state.favorites.includes(action.payload)) {
        state.favorites = state.favorites.filter((id) => id !== action.payload);
      } else {
        state.favorites.push(action.payload);
      }
    },
  },
});

export const {
  setSearchTerm,
  setSelectedEventType,
  setSelectedCategory,
  setSelectedSubcategory,
  setLocationRegionCode,
  setMinRating,
  toggleFavorite,
} = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
