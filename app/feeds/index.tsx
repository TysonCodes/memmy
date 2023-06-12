import React, {useEffect, useState} from "react";
import {Settings} from "react-native";
import {PostView} from "lemmy-js-client";
import ILemmyServer from "../../lemmy/types/ILemmyServer";
import {initialize, lemmyAuthToken, lemmyInstance} from "../../lemmy/LemmyInstance";
import FeedView from "../../ui/FeedView";

const FeedsIndex = () => {
    const [posts, setPosts] = useState<PostView[]|null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load().then();
    }, []);

    const load = async () => {
        setLoading(true);

        try {
            await initialize((Settings.get("servers") as ILemmyServer[])?.[0]);
        } catch(e) {
            setPosts(null);
            setLoading(false);
            return;
        }

        try {
            const res = await lemmyInstance.getPosts({
                auth: lemmyAuthToken,
                limit: 50,
                sort: "New"
            });

            setPosts(res.posts);
            setLoading(false);
        } catch(e) {
            setPosts(null);
            setLoading(false);
        }
    };

    return <FeedView posts={posts} loading={loading} load={load} />;
};

export default FeedsIndex;