using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace NewsWebsite.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateChatBotFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ArticleLikes",
                table: "ArticleLikes");

            migrationBuilder.DropIndex(
                name: "IX_ArticleLikes_ArticleId",
                table: "ArticleLikes");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "ArticleLikes",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ArticleLikes",
                table: "ArticleLikes",
                columns: new[] { "ArticleId", "UserId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ArticleLikes",
                table: "ArticleLikes");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "ArticleLikes",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ArticleLikes",
                table: "ArticleLikes",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ArticleLikes_ArticleId",
                table: "ArticleLikes",
                column: "ArticleId");
        }
    }
}
