import { T } from "../libs/types/comman";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";
import { ObjectId } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";

class ProductService {
  private readonly productModel;
  public viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  /* SPA */

  public async getProducts(inquery: ProductInquiry): Promise<Product[]> {
    const match: T = { productStatus: ProductStatus.PROCESS };

    if (inquery.productCollection)
      match.productCollection = inquery.productCollection;

    if (inquery.search)
      match.productName = { $regex: new RegExp(inquery.search, "i") };

    const sort: T =
      inquery.order === "productPrice"
        ? { [inquery.order]: 1 }
        : { [inquery.order]: -1 };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquery.page * 1 - 1) * inquery.limit },
        { $limit: inquery.limit * 1 },
      ])
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NOT_DATA_FOUND);

    return result;
  }

  public async getProduct(
    memberId: ObjectId | null,
    id: string | string[],
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);

    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.PROCESS,
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NOT_DATA_FOUND);

    if (memberId) {
      // Check Existence
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };

      const existView = await this.viewService.checkViewExistence(input);

      console.log("exist:", existView);

      if (!existView) {
        // Insert View
        await this.viewService.insertMemberView(input);

        // Increse Counts
        result = await this.productModel
          .findByIdAndUpdate(
            productId,
            { $inc: { productViwes: +1 } },
            { new: true },
          )
          .exec();
      }
    }

    return result;
  }

  /* SSR */

  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NOT_DATA_FOUND);

    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      return await this.productModel.create(input);
    } catch (err) {
      console.log("Error model:createNewProduct:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATED_FAILED);
    }
  }

  public async updateChosenProduct(
    id: string | string[],
    input: ProductUpdateInput,
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }
}

export default ProductService;
