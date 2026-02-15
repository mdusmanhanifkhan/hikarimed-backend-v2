

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export const PurchaseOrderPdfGenerator = async (po) => {
 const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

  const page = await browser.newPage();

   const html = `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 40px;
                font-size: 10px;
            }
            .container {
                width: 100%;
                border: 1px solid #000;
                padding: 20px;
                box-sizing: border-box;
            }
            .header, .details, .items-section, .totals-section, .footer {
                margin-bottom: 15px;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            .hospital-info {
                text-align: left;
            }
            .hospital-info h1 {
                font-size: 14px;
                margin: 0 0 5px 0;
                color: #333;
            }
            .hospital-info p {
                margin: 0;
                font-size: 10px;
            }
            .po-title {
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                margin-top: 15px;
                margin-bottom: 15px;
                border-top: 1px solid #000;
                border-bottom: 1px solid #000;
                padding: 5px 0;
            }
            .logo {
                /* Placeholder for a logo, if you have one */
                width: 50px;
                height: 50px;
                border: 1px solid #eee;
                display: inline-block;
                vertical-align: top;
            }

            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            .details-col {
                display: flex;
                flex-direction: column;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 2px 0;
            }
            .detail-row span:first-child {
                font-weight: bold;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            th, td {
                border: 1px solid #000;
                padding: 6px;
                text-align: left;
                font-size: 9px;
            }
            th {
                background-color: #f0f0f0;
                font-weight: bold;
            }
            .totals-table {
                width: 40%;
                float: right;
                margin-top: 15px;
            }
            .totals-table td:last-child {
                text-align: right;
            }

            .footer-message {
                margin-top: 80px;
                text-align: center;
                font-size: 8px;
                border-top: 1px solid #000;
                padding-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="hospital-info">
                    <h1>KINDR HOSPITAL & HEALTH NETWORK</h1>
                    <p>Shahrah-e-Pakistan Link Rd, Karachi.</p>
                </div>
                <div class="logo"></div> <!-- Logo placeholder -->
            </div>

            <div class="po-title">
                PURCHASE ORDER
            </div>

            <div class="details-grid">
                <div class="details-col">
                    <div class="detail-row">
                        <span>Vendor:</span>
                        <span>${po.distributor.name}</span>
                    </div>
                    <div class="detail-row">
                        <span>Contact Person:</span>
                        <span>Mr. Khan</span>
                    </div>
                    <div class="detail-row">
                        <span>Partial Delivery:</span>
                        <span>Items Not allowed</span>
                    </div>
                    <div class="detail-row">
                        <span>Payment Terms:</span>
                        <span>Credit</span>
                    </div>
                    <div class="detail-row">
                        <span>Ordered By:</span>
                        <span>(Signature Line)</span>
                    </div>
                </div>
                <div class="details-col">
                    <div class="detail-row">
                        <span>Purchase Order No:</span>
                        <span><strong>${po.poNo}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span>Purchase Order Date:</span>
                        <span>${new Date(po.poDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span>Delivery Via:</span>
                        <span>Local Transport</span>
                    </div>
                    <div class="detail-row">
                        <span>Delivery Terms:</span>
                        <span>FOB Karachi</span>
                    </div>
                    <div class="detail-row">
                        <span>Approved By:</span>
                        <span>(Signature Line)</span>
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Discount %</th>
                        <th>Tax %</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${po.items
                      .map(
                        (item) => `
                        <tr>
                            <td>${item.medicine.name}</td>
                            <td>${item.orderedQty}</td>
                            <td>${item.rate.toFixed(2)}</td>
                            <td>${item.discountPercent || 0}</td>
                            <td>${item.taxPercent || 0}</td>
                            <td>${item.totalAmount?.toFixed(2) || 0}</td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>

            <table class="totals-table">
                <tr>
                    <td>Grand Total:</td>
                    <td>${po.totalAmount?.toFixed(2) || 0}</td>
                </tr>
                <tr>
                    <td>Tax Amount:</td>
                    <td>${po.taxAmount?.toFixed(2) || 0}</td>
                </tr>
                <tr>
                    <td>Discount Amount:</td>
                    <td>${po.discountAmount?.toFixed(2) || 0}</td>
                </tr>
                <tr>
                    <td><strong>Net Amount:</strong></td>
                    <td><strong>${po.netAmount?.toFixed(2) || 0}</strong></td>
                </tr>
            </table>

            <div style="clear: both;"></div>


            <div class="footer-message">
                <p>This is Computer generated Approved Purchase Order. It does not require any Signature</p>
                <p>Printed Date: ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    </body>
    </html>
`;// your existing HTML

  // Save in a **relative folder** from project root
  const uploadsDir = path.join(process.cwd(), "generated/uploads/po");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // Use poNo for filename instead of numeric id
  // Replace spaces/slashes just in case
  const safePoNo = po.poNo.replace(/\s+/g, "_").replace(/\//g, "_");
  const fileName = `${safePoNo}.pdf`; 
  const filePath = path.join(uploadsDir, fileName);

  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({ path: filePath, format: "A4", printBackground: true });

  await browser.close();

  // Return **relative path for frontend**, NOT absolute path
  return `/generated/uploads/po/${fileName}`;
};
