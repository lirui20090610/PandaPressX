import axios from 'axios';
import {
    POST,
    POST_SUCCESS,
    POST_FAIL,
    END_POST,
    GET_SOURCEID,
    GET_SOURCEID_SUCCESS,
    GET_SOURCEID_FAIL,
    ADD_FILES,
    REMOVE_FILE,
    UPDATE_PROGRESS,
} from './types';
import { tokenConfig } from './authActions';
import { returnErrors } from './errorActions';

const imageLimit = 10;
const videoLimit = 2;

const videoSize = 10240000000; // 10GB
// image size restrictions
const imageWidth = 300;
const imageHeight = 300;
const imageQuality = 1; // range 0~1 (the higher the better)


// Uploading users' posts to the server
export const uploadPost = ({ title, userID, content }) => (dispatch, getState) => {

    dispatch({ type: POST });
    // Request body
    const body = JSON.stringify({ title, userID, content });

    // Users need jwt in order to be authenticated and then post
    axios.post('/api/post', body, tokenConfig(getState))
        .then(res => dispatch({
            type: POST_SUCCESS,
            payload: res.data
        }))
        .catch(err => {
            dispatch(returnErrors(err.response.data.msg));
            dispatch({
                type: POST_FAIL
            });
        });
};



export const getSourceID = () => (dispatch, getState) => {
    dispatch({ type: GET_SOURCEID });
    axios.get('/api/post/sourceid', tokenConfig(getState))
        .then(res =>
            dispatch({
                type: GET_SOURCEID_SUCCESS,
                payload: res.data
            }))
        .catch(err => {
            dispatch({
                type: GET_SOURCEID_FAIL,
            });
            dispatch(returnErrors(err.response.data.msg))
        });

}


export const removeFile = file => (dispatch, getState) => {
    let imageNum = getState().post.imageNum;
    let videoNum = getState().post.videoNum;
    if (file.type === 'image') {
        imageNum--;
    } else if (file.type === 'video') {
        videoNum--;
    }

    //For optimal memory usage, free URLs when we no longer need them
    URL.revokeObjectURL(file.source);

    const body = JSON.stringify({
        sourceID: getState().post.sourceID,
        type: file.type,
        index: file.index
    });

    dispatch({
        type: REMOVE_FILE,
        payload: {
            files: getState().post.files.filter(element => element !== file),
            imageNum,
            videoNum,
            imageFull: imageNum === imageLimit,
            videoFull: videoNum === videoLimit,
        }
    });
    let config = tokenConfig(getState);
    config.data = body;
    // Users need jwt in order to be authenticated and then post
    axios.delete('/api/post/delete', config)
        .then(res =>
            console.log(res)
        )
};

export const addFiles = files => (dispatch, getState) => {
    let fileLength = files.length;
    let imageNum = getState().post.imageNum;
    let videoNum = getState().post.videoNum;

    if (getState().post.sourceID === null) {
        dispatch(getSourceID());
    }

    if (files[0].type.includes('image')) {
        if (imageNum + fileLength > imageLimit) {
            dispatch(returnErrors(`Picking too many images, Only ${imageLimit} images are allowd.`));
            return;
        }
        imageNum += fileLength;

        [...files].map(image => uploadImage(image, dispatch, getState));

    } else if (files[0].type.includes('video')) {
        if (videoNum + fileLength > videoLimit) {
            dispatch(returnErrors(`Picking too many videos, Only ${videoLimit} videos are allowd.`));
            return;
        }
        videoNum += fileLength;
        [...files].map(video => uploadVideo(video, dispatch, getState));
    }

};

export const uploadImage = (image, dispatch, getState) => {
    var reader = new FileReader();
    var img = new Image();
    reader.readAsDataURL(image);
    reader.onload = e => {
        img.src = e.target.result;
    };

    img.onload = () => {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var originWidth = img.width;
        var originHeight = img.height;

        var targetWidth = originWidth,
            targetHeight = originHeight;

        if (originWidth > imageWidth || originHeight > imageHeight) {
            if (originWidth / originHeight > imageWidth / imageHeight) {
                targetWidth = imageWidth;
                targetHeight = Math.round(imageWidth * (originHeight / originWidth));
            } else {
                targetHeight = imageHeight;
                targetWidth = Math.round(imageHeight * (originWidth / originHeight));
            }
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        context.clearRect(0, 0, targetWidth, targetHeight);

        context.drawImage(img, 0, 0, targetWidth, targetHeight);


        let data = new FormData();
        let file;


        canvas.toBlob((blob) => {
            file = {
                type: image.type.split("/")[0],
                progress: 0,
                source: URL.createObjectURL(blob),
                index: getState().post.fileNum
            };
            dispatch({
                type: ADD_FILES,
                payload: {
                    imageNum: getState().post.imageNum += 1,
                    videoNum: getState().post.videoNum,
                    fileNum: getState().post.fileNum += 1,
                    files: [...getState().post.files, file],
                    imageFull: getState().post.imageNum++ === imageLimit,
                    videoFull: getState().post.videoNum === videoLimit,
                }
            });

            // filename format: sourceID_fileindex
            console.log(getState().post.sourceID);
            data.append('postSRC', blob, getState().post.sourceID + '_' + file.index);
            // console.log(data);
            axios.post('/api/post/upload', data, fileConfig(file, dispatch, getState))
                .then(res => {
                    console.log(res);
                });

        }, 'image/jpeg', imageQuality);



    };

}

export const uploadVideo = (video, dispatch, getState) => {
    if (video.size > videoSize) {
        dispatch(returnErrors(`Video is oversized, Only videos within 1GB are are allowd.`));
        return;
    }


    let file = {
        type: video.type.split("/")[0],
        progress: 0,
        source: URL.createObjectURL(video),
        index: getState().post.fileNum
    };

    dispatch({
        type: ADD_FILES,
        payload: {
            imageNum: getState().post.imageNum,
            videoNum: getState().post.videoNum += 1,
            fileNum: getState().post.fileNum += 1,
            files: [...getState().post.files, file],
            imageFull: getState().post.imageNum === imageLimit,
            videoFull: getState().post.videoNum++ === videoLimit,
        }
    });



    let data = new FormData();
    console.log(getState().post.sourceID);
    data.append('postSRC', video, getState().post.sourceID + '_' + file.index);

    axios.post('/api/post/upload', data, fileConfig(file, dispatch, getState))
        .then(res => {
            console.log(res);
        });


}

export const endPost = () => (dispatch, getState) => {
    getState().post.files.map(e => URL.revokeObjectURL(e.source));
    dispatch({
        type: END_POST
    })
}

export const fileConfig = (file, dispatch, getState) => {
    let config;
    return config = {
        onUploadProgress: function (progressEvent) {
            var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            file.progress = percentCompleted;
            dispatch({
                type: UPDATE_PROGRESS,
                payload: {
                    files: Object.assign(getState().post.files, getState().post.files.map(el => el.source === file.source ? file : el))
                }
            });

        },
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': getState().auth.token,
        },
    };
}