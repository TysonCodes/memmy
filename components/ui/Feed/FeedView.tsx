import React, {useEffect, useRef, useState} from "react";
import {ListingType, PostView, SortType} from "lemmy-js-client";
import {useTheme, useToast, View} from "native-base";
import {Button, RefreshControl, StyleSheet} from "react-native";
import FeedItem from "./FeedItem";
import LoadingView from "../Loading/LoadingView";
import LoadingErrorView from "../Loading/LoadingErrorView";
import {useActionSheet} from "@expo/react-native-action-sheet";
import {FlashList} from "@shopify/flash-list";
import SortIconType from "../../../types/SortIconType";
import CIconButton from "../CIconButton";
import FeedHeaderDropdownDrawer from "./FeedHeaderDropdownDrawer";
import {useAppDispatch, useAppSelector} from "../../../store";
import {selectFeed, setDropdownVisible} from "../../../slices/feed/feedSlice";
import {subscribeToCommunity} from "../../../slices/communities/communitiesActions";
import {isSubscribed} from "../../../lemmy/LemmyHelpers";
import {selectCommunities} from "../../../slices/communities/communitiesSlice";
import {useNavigation} from "@react-navigation/native";
import {trigger} from "react-native-haptic-feedback";
import {UseFeed} from "../../hooks/feeds/feedsHooks";
import LoadingFooter from "../Loading/LoadingFooter";
import LoadingErrorFooter from "../Loading/LoadingErrorFooter";

interface FeedViewProps {
    feed: UseFeed;
    community?: boolean
}

const FeedView = (
    {
        feed,
        community = false,
    }: FeedViewProps) =>
{
    const navigation = useNavigation();

    const [endReached, setEndReached] = useState(false);

    const toast = useToast();

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => {
                if(dropdownVisible) {
                    return <Button title={"Cancel"} onPress={() => dispatch(setDropdownVisible())} />;
                }

                return (
                    <>
                        <CIconButton name={sortIcon} onPress={onSortPress} />
                        <CIconButton name={"ellipsis-horizontal-outline"} onPress={onEllipsisButtonPress} />
                    </>
                );
            }
        });
    }, []);

    const [sortIcon, setSortIcon] = useState(SortIconType[2]);

    const flashList = useRef<FlashList<any>>();

    const {dropdownVisible} = useAppSelector(selectFeed);
    const {subscribedCommunities} = useAppSelector(selectCommunities);

    const {showActionSheetWithOptions} = useActionSheet();
    const dispatch = useAppDispatch();
    const theme = useTheme();

    const feedItem = ({item}: {item: PostView}) => {
        return (
            <FeedItem post={item} />
        );
    };

    const onSortPress = () => {
        const options = ["Top Day", "Top Week", "Hot", "Active", "New", "Most Comments", "Cancel"];
        const cancelButtonIndex = 6;

        showActionSheetWithOptions({
            options,
            cancelButtonIndex
        }, (index: number) => {
            if(index === cancelButtonIndex) return;

            if(index === 0) {
                feed.setSort("TopDay");
            } else if(index === 1) {
                feed.setSort("TopWeek");
            } else if(index === 5) {
                feed.setSort("MostComments");
            } else {
                feed.setSort(options[index] as SortType);
            }

            setSortIcon(SortIconType[index]);
            flashList?.current?.scrollToOffset({animated: true, offset: 0});
        });
    };

    const onEllipsisButtonPress = () => {
        if(community) {
            const subscribed = isSubscribed(feed.posts[0].community.id, subscribedCommunities);

            const options = [subscribed ? "Unsubscribe" : "Subscribe", "Cancel"];
            const cancelButtonIndex = 1;

            showActionSheetWithOptions({
                options,
                cancelButtonIndex
            }, (index: number) => {
                if (index === cancelButtonIndex) return;

                if (index === 0) {
                    trigger("impactMedium");
                    toast.show({
                        title: `${!subscribed ? "Subscribed to" : "Unsubscribed from"} ${feed.posts[0].community.name}`,
                        duration: 3000
                    });

                    dispatch(subscribeToCommunity({
                        communityId: feed.posts[0].community.id,
                        subscribe: !subscribed
                    }));
                }
            });
        } else {
            const options = ["All", "Local", "Subscribed", "Cancel"];
            const cancelButtonIndex = 3;

            showActionSheetWithOptions({
                options,
                cancelButtonIndex
            }, (index: number) => {
                if(index === cancelButtonIndex) return;

                feed.setListingType(options[index] as ListingType);
                flashList?.current?.scrollToOffset({animated: true, offset: 0});
            });
        }
    };

    const keyExtractor = (item) => item.post.id.toString();
    const refreshControl = <RefreshControl
        refreshing={feed.postsLoading}
        onRefresh={() => feed.doLoad(true)}
        tintColor={theme.colors.screen[300]}
    />;

    const footer = () => {
        if(feed.postsLoading && feed.posts.length > 0) {
            return <LoadingFooter message={"Loading more posts..."} />;
        } else if(feed.postsError) {
            return <LoadingErrorFooter message={"Failed to load posts"} onRetryPress={feed.doLoad} />;
        }
    };

    return (
        <View style={styles.container} backgroundColor={"screen.900"}>
            <FeedHeaderDropdownDrawer />

            {
                feed.postsLoading && !feed.posts ? <LoadingView /> : (
                    <FlashList
                        data={feed.posts}
                        renderItem={feedItem}
                        keyExtractor={keyExtractor}
                        refreshControl={refreshControl}
                        onEndReachedThreshold={0.8}
                        estimatedItemSize={300}
                        estimatedListSize={{height: 50, width: 1}}
                        ListFooterComponent={feed.postsLoading ? <LoadingView /> : null}
                        onEndReached={() => setEndReached(true)}
                        ref={flashList}
                        onMomentumScrollEnd={() => {
                            if(endReached) {
                                feed.doLoad();
                                setEndReached(false);
                            }
                        }}
                    />
                )
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default FeedView;