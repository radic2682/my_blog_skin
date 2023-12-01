const main_project_box_wrapper = document.querySelector("#main_page #project_box_wrapper");

const tistoryAPI = {
    baseURL : "https://www.tistory.com/apis/post/list",
    outputType : "json",
    blogName : "sunhong-dev",
    token: "eae562fa2b17be32aa74a2af53470751_81d391b385ede7c8b371ad4676dbea21"
};

const postList = [];

const fetchPosts = () => {
    let pageNumber = 1;

    const fetchData = () => {
        const url = `${tistoryAPI.baseURL}?access_token=${tistoryAPI.token}&output=${tistoryAPI.outputType}&blogName=${tistoryAPI.blogName}&page=${pageNumber}`;

        return fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data.tistory.item.posts && data.tistory.item.posts.length > 0) {
                    postList.push(...data.tistory.item.posts);
                    pageNumber++;
                    return fetchData();
                } else {
                    return Promise.resolve();
                }
            });
    };

    return fetchData();
};

const fetchPostThumbnailUrls = async () => {
    const promises = postList.map(async (post) => {
        const url = `https://www.tistory.com/apis/post/read?access_token=${tistoryAPI.token}&output=json&blogName=${tistoryAPI.blogName}&postId=${post.id}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('API 호출이 실패했습니다.');
        }

        const data = await response.json();
        const thumb = extractThumbnailUrl(data.tistory.item.content);
        post.thumb = thumb;
    });

    await Promise.all(promises);
};
const extractThumbnailUrl = (contentHtml) => {
    let parser = new DOMParser();
    let doc = parser.parseFromString(contentHtml, 'text/html');
    let imgTag = doc.querySelector('img');
    return imgTag ? imgTag.src : null;
};



fetchPosts()
    .then(fetchPostThumbnailUrls)
    .then(() => {
        const postList_Projects = postList.filter(item => item.categoryId === "680132");
        console.log(postList_Projects);

        postList_Projects.forEach((proj) => {
            const newProjectBox = createProjectBox(proj);
            main_project_box_wrapper.appendChild(newProjectBox);
            console.log(proj, proj.thumb?.toString());
        });
    })
    .catch((error) => console.error('오류 발생:', error));


const createProjectBox = (proj) => {
    const projectTemplate = `
        <div id="new_project_box" OnClick="location.href ='${proj.postUrl}'" style="cursor:pointer;">
            <div id="imgBox">
                <img src="${proj.thumb}" />
            </div>
            <p id="box_title">${proj.title}</p>
            <p id="signature">Sun Hong</p>
        </div>
    `;

    const parser = new DOMParser();
    const projectFragment = parser.parseFromString(projectTemplate, 'text/html');
    const projectBox = projectFragment.body.firstChild;

    return projectBox;
}
