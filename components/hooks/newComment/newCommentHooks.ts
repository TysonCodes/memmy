import {useState} from "react";
import {useDispatch} from "react-redux";
import {useAppSelector} from "../../../store";
import {selectNewComment} from "../../../slices/newComment/newCommentSlice";
import {lemmyAuthToken, lemmyInstance} from "../../../lemmy/LemmyInstance";
import {setPostNewComment} from "../../../slices/post/postSlice";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {Alert} from "react-native";

export const useNewComment = () => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const dispatch = useDispatch();

    const {responseTo} = useAppSelector(selectNewComment);

    const doSubmit = async () => {
        if(!content) {
            return;
        }

        try {
            setLoading(true);

            const res = await lemmyInstance.createComment({
                auth: lemmyAuthToken,
                content: content,
                post_id: responseTo.post ? responseTo.post.post.id : responseTo.comment.post.id,
                parent_id: responseTo.comment ? responseTo.comment.comment.id : undefined
            });

            dispatch(setPostNewComment({
                comment: res.comment_view,
                isTopComment: !!responseTo.post
            }));

            navigation.pop();
        } catch(e) {
            setLoading(false);

            if(e.toString() === "rate_limit_error") {
                Alert.alert("Error", "Rate limit error. Please try again shortly...");
                return;
            }

            Alert.alert("Error", e.toString());
        }
    };

    return {
        content,
        loading,
        doSubmit,
        setContent
    };
};
