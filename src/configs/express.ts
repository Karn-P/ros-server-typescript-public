import express from "express";

export default async (app: any) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};
