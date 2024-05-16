import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

class ArticleHandler {
  async addArticle(req, res) {
    try {
      const id = `Article-${nanoid(8)}`;
      const { title, content } = req.body;
      if (!title || !content) {
        throw { code: 428, message: "FIELDS_IS_REQUIRED" };
      }
      const newArticle = await prisma.article.create({
        data: {
          id: id,
          title: title,
          content: content,
          user: { connect: { id: req.userId } }, // Menambahkan relasi dengan user yang membuat artikel
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
}

export default new ArticleHandler();
