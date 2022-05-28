import * as yup from 'yup';
const postSchema = yup.object({
    title: yup.string().required(),
    content: yup.string().required(),
});
export { postSchema };
