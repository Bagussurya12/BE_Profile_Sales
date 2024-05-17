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
  async getAllArticle(req, res) {
    try {
      const { page = 1, perPage = 10 } = req.query;
      const skip = (page - 1) * perPage;
      // const users = await prisma.user.findMany({
      //   skip: skip,
      //   take: perPage,
      // });
      const article = await prisma.article.findMany({
        skip: skip,
        take: perPage,
      });
      if (!article || article.length === 0) {
        throw { code: 404, message: "ARTICLE_NOT_FOUND" };
      }
      return res.status(200).json({
        status: true,
        message: "SUCCESS_GET_ALL_ARTICLE",
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
  async deleteArticleById(req, res) {
    try {
      const articleId = req.params.id;
      if (!articleId) {
        throw { code: 428, message: "ID_IS_REQUIRED" };
      }
      const deleteArticle = await prisma.article.delete({
        where: { id: articleId },
      });
      if (!deleteArticle) {
        throw { code: 500, message: "DELETE_ARTICLE_FAILED" };
      }
      return res.status(200).json({
        status: true,
        message: "SUCESS_DELETE_ARTICLE",
        deleteArticle,
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
  async updateArticleById(req, res) {
    try {
      const articleId = req.params.articleId;
      if (!articleId) {
        throw { code: 428, message: "ID_IS_REQUIRED" };
      }
      const { title, content } = req.body;

      const files = req.files;
      let photos = null;
      if (files && files.length > 0) {
        photos = files[0].filename;
      }

      const article = await prisma.article.update({
        where: { id: articleId },
        data: {
          title: title,
          photos: photos,
          content: content,
        },
      });

      if (!article) {
        throw { code: 500, message: "UPDATE_ARTICLE_FAILED" };
      }
      return res.status(200).json({
        status: true,
        message: "UPDATE_ARTICLE_SUCCESS",
        article: article,
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
