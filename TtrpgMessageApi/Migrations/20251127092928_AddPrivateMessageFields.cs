using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TtrpgMessageApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPrivateMessageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SenderId",
                table: "Messages",
                newName: "PlayerId");

            migrationBuilder.AddColumn<bool>(
                name: "IsFromDm",
                table: "Messages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SenderName",
                table: "Messages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_PlayerId",
                table: "Messages",
                column: "PlayerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Players_PlayerId",
                table: "Messages",
                column: "PlayerId",
                principalTable: "Players",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Players_PlayerId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_PlayerId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "IsFromDm",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "SenderName",
                table: "Messages");

            migrationBuilder.RenameColumn(
                name: "PlayerId",
                table: "Messages",
                newName: "SenderId");
        }
    }
}
