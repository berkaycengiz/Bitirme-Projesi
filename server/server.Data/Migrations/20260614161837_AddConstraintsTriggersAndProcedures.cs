using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddConstraintsTriggersAndProcedures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_Products_Price",
                table: "Products",
                sql: "[Price] > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_OrderDetails_Quantity",
                table: "OrderDetails",
                sql: "[Quantity] >= 1");

            // trigger trg_UpdateOrderTotalPrice
            migrationBuilder.Sql(@"
                CREATE TRIGGER trg_UpdateOrderTotalPrice
                ON OrderDetails
                AFTER INSERT, UPDATE, DELETE
                AS
                BEGIN
                    SET NOCOUNT ON;
                    
                    DECLARE @affectedOrders TABLE (OrderID INT);
                    
                    INSERT INTO @affectedOrders (OrderID)
                    SELECT DISTINCT OrderID FROM inserted
                    UNION
                    SELECT DISTINCT OrderID FROM deleted;
                    
                    UPDATE o
                    SET o.TotalPrice = COALESCE((
                        SELECT SUM(d.Quantity * d.UnitPrice)
                        FROM OrderDetails d
                        WHERE d.OrderID = o.OrderID
                    ), 0)
                    FROM Orders o
                    INNER JOIN @affectedOrders a ON o.OrderID = a.OrderID;
                END;
            ");

            // stored procedure sp_GetDailySalesReport
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetDailySalesReport
                    @ReportDate DATE
                As
                BEGIN
                    SET NOCOUNT ON;

                    SELECT 
                        COUNT(OrderID) AS TotalOrders,
                        COALESCE(SUM(TotalPrice), 0) AS TotalRevenue
                    FROM Orders
                    WHERE CAST(OrderDate AS DATE) = @ReportDate;

                    SELECT TOP 5
                        p.ProductName,
                        SUM(d.Quantity) AS TotalQtySold,
                        SUM(d.Quantity * d.UnitPrice) AS TotalProductRevenue
                    FROM OrderDetails d
                    INNER JOIN Products p ON d.ProductID = p.ProductID
                    INNER JOIN Orders o ON d.OrderID = o.OrderID
                    WHERE CAST(o.OrderDate AS DATE) = @ReportDate
                    GROUP BY p.ProductName
                    ORDER BY TotalQtySold DESC;
                END;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetDailySalesReport;");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_UpdateOrderTotalPrice;");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Products_Price",
                table: "Products");

            migrationBuilder.DropCheckConstraint(
                name: "CK_OrderDetails_Quantity",
                table: "OrderDetails");
        }
    }
}
