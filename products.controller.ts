import * as express from 'express';
import axios from "axios";
const cheerio = require('cheerio');

class BrandController {
    public async getAllBrandNames(request: express.Request, response: express.Response) {
        try {
            const pageHTML = await axios.get(request.url);
            const brandNames: any = [];
            const $ = cheerio.load(pageHTML.data);
            $(".brandmenu-v2 li a").each((index: any, element: any) => {
                const brandName = $(element).text()
                const slug = $(element).attr('href')
                brandNames.push({ name: brandName, slug });
            })

            return response.send({ brands: brandNames });
        } catch (error) {
            response.send("Error while getting data");
            console.log(error)
        }
    }

    public getProductsByBrand = async (request: express.Request, response: express.Response) => {
        try {
            const { body: { limit = 0, brandSlug = null } } = request;
            const brandProducts: any = [];
            let paginatedIndex = 0;

            const $ = await this.getDomStructure(`${request.url}/${brandSlug}`);

            $(".makers li a").each((index: any, element: any) => {
                const productName = $(element).text();
                const slug = $(element).attr("href");
                const imageUrl = $(element).children("img").attr("src");

                brandProducts.push({ productName, imageUrl, slug });
            });
            const pagesDom = $(".nav-pages a");
            const totalPages = pagesDom.length;
            while (brandProducts.length < limit || paginatedIndex === totalPages) {
                const nextPageSlug = pagesDom[paginatedIndex].attributes[0].value;
                const nextDom = await this.getDomStructure(`${request.url}/${nextPageSlug}`);
                nextDom(".makers li a").each((index: any, element: any) => {
                    const productName = nextDom(element).text();
                    const slug = nextDom(element).attr("href");
                    const imageUrl = nextDom(element).children("img").attr("src");

                    brandProducts.push({ productName, imageUrl, slug });
                });
                paginatedIndex++;
            }
            const resArray = brandProducts.length > limit ? brandProducts.slice(0,limit): brandProducts;
            return response.send({ totalPages, totalRecords: resArray.length, products: resArray });
        } catch (error) {
            response.send("Error while getting data");
            console.log(error)
        }
    }

    public async getProductsDetails(request: express.Request, response: express.Response) {
        try {
            const res: any = {
                payload: [],
                message: "Products received successfully"
            };
            const { body: { mobileSlugs = [] } } = request;

            for (const i in mobileSlugs) {
                const productDetail: any = {};

                const pageHTML = await axios.get(`${request.url}/${mobileSlugs[i]}`);
                const $ = cheerio.load(pageHTML.data);
                const title = $(".specs-phone-name-title").text()
                $("tbody").each((index: any, row: any) => {
                    const header = $("th", row).text();
                    productDetail[header] = {}
                    const subHeader = $(".ttl", row);
                    const subData = $(".nfo", row);

                    subHeader.each((index: any, rowData: any) => {
                        const data = subData[index].children[0].data || subData[index].children[0].children[0].data;
                        productDetail[header][$("a", rowData).text()] = data;
                    })
                });
                res.payload.push({ title, products: productDetail })
            }
            return response.send(res);
        } catch (error) {
            response.send("Error while getting data");
            console.log(error)
        }
    }

    public async getDomStructure(url: any) {
        const pageHTML = await axios.get(url);
        return cheerio.load(pageHTML.data);
    }
}

export default new BrandController();