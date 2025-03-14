import {useEffect, useState} from "react";
import {ListingType, PostView, SortType} from "lemmy-js-client";
import {useAppDispatch, useAppSelector} from "../../../store";
import {selectSettings} from "../../../slices/settings/settingsSlice";
import {lemmyAuthToken, lemmyInstance} from "../../../lemmy/LemmyInstance";
import {removeDuplicatePosts} from "../../../lemmy/LemmyHelpers";
import {clearUpdateVote, selectFeed} from "../../../slices/feed/feedSlice";

export interface UseFeed {
    posts: PostView[]|null;
    postsLoading: boolean;
    postsError: boolean;

    sort: SortType;
    setSort: (sort: SortType) => void;

    listingType: ListingType;
    setListingType: (listingType: ListingType) => void;

    doLoad: (refresh?: boolean) => void;
}

export const useFeed = (communityId?: number): UseFeed => {
    const {defaultSort, defaultListingType} = useAppSelector(selectSettings);
    const {updateVote} = useAppSelector(selectFeed);
    const dispatch = useAppDispatch();

    const [posts, setPosts] = useState<PostView[]|null>(null);
    const [postsLoading, setPostsLoading] = useState<boolean>(false);
    const [postsError, setPostsError] = useState<boolean>(false);

    const [sort, setSort] = useState<SortType>(defaultSort);
    const [listingType, setListingType] = useState<ListingType>(defaultListingType);
    const [nextPage, setNextPage] = useState(1);

    useEffect(() => {
        if(lemmyInstance) {
            doLoad(true);
        }
    }, [sort, listingType]);

    useEffect(() => {
        if(updateVote) {
            setPosts(posts?.map(post => {
                if(post.post.id === updateVote.postId) {
                    post.my_vote = updateVote.vote;
                }

                return post;
            }));
            dispatch(clearUpdateVote());
        }
    }, [updateVote]);


    const doLoad = async (refresh = false) => {
        setPostsLoading(true);
        setPostsError(false);

        try {
            const res = await lemmyInstance.getPosts({
                auth: lemmyAuthToken,
                community_id: communityId ?? undefined,
                limit: 20,
                page: refresh ? 1 : nextPage,
                sort: sort,
                type_: listingType,
            });

            if(!posts || refresh) {
                setPosts(res.posts);
                setNextPage(2);
            } else {
                setPosts(prev => [...prev, ...removeDuplicatePosts(prev.slice(0, 50), res.posts)]);
                setNextPage(prev => prev + 1);
            }

            setPostsLoading(false);
        } catch(e) {
            setPosts(null);
            setPostsError(false);
            setPostsError(true);
        }
    };

    return {
        posts,
        postsLoading,
        postsError,

        sort,
        setSort,

        listingType,
        setListingType,

        doLoad,
    };
};