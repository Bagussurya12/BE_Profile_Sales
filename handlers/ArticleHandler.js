import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

class ArticleHandler {
  async addArticle(req, res) {
    try {
      const id = `Article-${nanoid(8)}`;
      const { title, content } = req.body;

      // Map the uploaded files to get their paths
      const files = req.files;
      let photos = null;
      if (files && files.length > 0) {
        photos = files[0].filename;
      }

      const newArticle = await prisma.article.create({
        data: {
          id: id,
          title: title,
          content: content,
          photos: photos, // Save the array of photo paths
        },
      });

      if (!newArticle) {
        throw { code: 500, message: "ADD_ARTICLE_FAILED" };
      }

      return res.status(200).json({
        status: true,
        message: "ADD_ARTICLE_SUCCESS",
        Article: newArticle,
      });
    } catch (error) {
      if (!error.code) {
        error.code = 500;
      }
      return res.status(error.code).json({
        status: false,
        message: error.message,
      });
    }
  }
  async getArticleById(req, res) {
    try {
      const articleId = req.params.articleId;
      if (!articleId) {
        throw { code: 428, message: "ID_IS_REQUIRED" };
      }
      const article = await prisma.article.findUnique({
        where: { id: articleId },
      });
      if (!article) {
        throw { code: 404, message: "ARTICLE_NOT_FOUND" };
      }
      return res.status(200).json({
        status: true,
        message: "SUCCESS_GET_ARTICLE",
        data: article,
      });
    } catch (error) {
      if (!error.code) {
        error.code = 500;
      }
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}

export default new ArticleHandler();
