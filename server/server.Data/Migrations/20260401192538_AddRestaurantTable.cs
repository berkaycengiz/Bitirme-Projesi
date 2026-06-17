using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TableNumber",
                table: "Orders",
                newName: "TableID");

            migrationBuilder.CreateTable(
                name: "RestaurantTables",
                columns: table => new
                {
                    TableID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TableNumber = table.Column<int>(type: "int", nullable: false),
                    QrCode = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsOccupied = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RestaurantTables", x => x.TableID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_TableID",
                table: "Orders",
                column: "TableID");

            migrationBuilder.CreateIndex(
                name: "IX_RestaurantTables_QrCode",
                table: "RestaurantTables",
                column: "QrCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RestaurantTables_TableNumber",
                table: "RestaurantTables",
                column: "TableNumber",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_RestaurantTables_TableID",
                table: "Orders",
                column: "TableID",
                principalTable: "RestaurantTables",
                principalColumn: "TableID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_RestaurantTables_TableID",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "RestaurantTables");

            migrationBuilder.DropIndex(
                name: "IX_Orders_TableID",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "TableID",
                table: "Orders",
                newName: "TableNumber");
        }
    }
}
