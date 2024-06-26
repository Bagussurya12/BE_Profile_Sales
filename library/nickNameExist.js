import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const isNickNameExist = async (nickName) => {
  const user = await prisma.user.findFirst({
    where: {
      nick_name: nickName,
    },
  });
  return user !== null;
};

const isNickNameExistWithUserId = async (id, nickName) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
      nick_name: nickName,
    },
  });
  return user !== null;
};

export { isNickNameExist, isNickNameExistWithUserId };
