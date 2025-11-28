# api/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TtrpgMessageApi.csproj", "./"]
RUN dotnet restore "TtrpgMessageApi.csproj"
COPY . .
RUN dotnet publish "TtrpgMessageApi.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TtrpgMessageApi.dll"]
