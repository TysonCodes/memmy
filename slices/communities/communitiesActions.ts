import {createAsyncThunk} from "@reduxjs/toolkit";
import {lemmyAuthToken, lemmyInstance} from "../../lemmy/LemmyInstance";

export const getAllCommunities = createAsyncThunk(
    "communities/getAllCommunities",
    async (_, thunkAPI) => {
        try {
            const res = await lemmyInstance.listCommunities({
                auth: lemmyAuthToken,
                type_: "All",
                limit: 50,
            });

            return res.communities;
        } catch(e) {
            thunkAPI.rejectWithValue(e);
        }
    }
);

export const getLocalCommunities = () => {

};

export const getSubscribedCommunities = createAsyncThunk(
    "communities/getSubscribedCommunities",
    async (_, thunkAPI) => {
        try {
            const res = await lemmyInstance.listCommunities({
                auth: lemmyAuthToken,
                type_: "Subscribed",
                limit: 50,
            });

            return res.communities.sort((a, b) => a.community.name.localeCompare(b.community.name));
        } catch(e) {
            thunkAPI.rejectWithValue(e);
        }
    }
);

interface SubscribeToCommunityOptions {
    communityId: number,
    subscribe: boolean
}

export const subscribeToCommunity = createAsyncThunk(
    "communities/subscribeToCommunity",
    async(data: SubscribeToCommunityOptions, thunkAPI) => {
        try {
            await lemmyInstance.followCommunity({
                auth: lemmyAuthToken,
                community_id: data.communityId,
                follow: data.subscribe
            });

            thunkAPI.dispatch(getSubscribedCommunities());
        } catch(e) {
            thunkAPI.rejectWithValue(e);
        }
    }
);
