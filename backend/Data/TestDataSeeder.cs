using NewsWebsite.API.Models;

namespace NewsWebsite.API.Data;

public static class TestDataSeeder
{
    public static async Task SeedTestArticles(ApplicationDbContext context)
    {
        // Always clear and re-seed for development to ensure we have the latest test data
        if (context.Articles.Any())
        {
            context.Articles.RemoveRange(context.Articles);
            await context.SaveChangesAsync();
        }

        // Find specific categories by name
        var financeCategory = context.Categories.FirstOrDefault(c => c.Name == "Финанси");
        var techCategory = context.Categories.FirstOrDefault(c => c.Name == "Техологии");
        var lifestyleCategory = context.Categories.FirstOrDefault(c => c.Name == "Лайфстайл");
        var healthCategory = context.Categories.FirstOrDefault(c => c.Name == "Здраве");
        var cultureCategory = context.Categories.FirstOrDefault(c => c.Name == "Култура");
        
        // Fallback to first available category if specific ones don't exist
        var defaultCategory = context.Categories.FirstOrDefault();
        if (defaultCategory == null)
        {
            defaultCategory = new Category
            {
                Name = "General",
                CreatedAt = DateTime.UtcNow
            };
            context.Categories.Add(defaultCategory);
            await context.SaveChangesAsync();
        }

        // Find an admin user to be the author
        var adminUser = context.Users.FirstOrDefault(u => u.IsAdmin);
        if (adminUser == null)
        {
            return; // No admin user found, articles cannot be created without an author
        }

        var testArticles = new List<NewsArticle>
        {
            // English Articles
            new NewsArticle
            {
                Title = "Welcome to Our News Website",
                Preview = "A welcome message and introduction to our news platform.",
                Body = "This is a sample article to demonstrate our news platform. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                AuthorId = adminUser.Id,
                CategoryId = cultureCategory?.Id ?? defaultCategory.Id,
                ImageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&w=800&q=80",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new NewsArticle
            {
                Title = "Technology Trends in 2025",
                Preview = "An overview of the latest technology trends shaping 2025.",
                Body = "The technology landscape is rapidly evolving in 2025. AI, machine learning, and automation continue to shape various industries. This article explores the latest trends and their impact on businesses and society. From generative AI to quantum computing, the possibilities seem endless. Virtual reality and augmented reality are becoming mainstream, while blockchain technology is revolutionizing finance and supply chain management.",
                AuthorId = adminUser.Id,
                CategoryId = techCategory?.Id ?? defaultCategory.Id,
                ImageUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&w=800&q=80",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddHours(-6),
                UpdatedAt = DateTime.UtcNow.AddHours(-6)
            },
            new NewsArticle
            {
                Title = "Global Economic Outlook",
                Preview = "Analysis of current economic conditions and future outlook.",
                Body = "Economic experts analyze the current state of the global economy and provide insights into future trends. Market volatility, inflation concerns, and growth prospects are key topics discussed. The interconnected nature of global markets makes economic forecasting both challenging and crucial for policymakers. Interest rates, unemployment figures, and consumer confidence all play vital roles in economic stability.",
                AuthorId = adminUser.Id,
                CategoryId = financeCategory?.Id ?? defaultCategory.Id,
                ImageUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&w=800&q=80",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddHours(-12),
                UpdatedAt = DateTime.UtcNow.AddHours(-12)
            },
            new NewsArticle
            {
                Title = "The Art of Minimalism: Simplifying Your Life",
                Preview = "Discover how minimalism can transform your lifestyle and bring more peace and focus.",
                Body = "Minimalism is more than just decluttering your physical space - it's a philosophy that can transform your entire approach to life. By focusing on what truly matters and eliminating the excess, minimalism helps reduce stress, increase productivity, and improve overall well-being. Start small by decluttering one room at a time, then apply minimalist principles to your digital life, relationships, and commitments. The goal isn't to live with nothing, but rather to live with intention, surrounding yourself only with items and activities that add genuine value to your life.",
                AuthorId = adminUser.Id,
                CategoryId = lifestyleCategory?.Id ?? defaultCategory.Id,
                ImageUrl = "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&w=800&q=80",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                UpdatedAt = DateTime.UtcNow.AddHours(-2)
            },
            new NewsArticle
            {
                Title = "Mental Health and Wellness in Modern Society",
                Preview = "Understanding the importance of mental health and strategies for maintaining psychological well-being.",
                Body = "Mental health has become a critical topic in today's fast-paced society. Stress, anxiety, and depression affect millions of people worldwide, making it essential to prioritize psychological well-being alongside physical health. Regular exercise, adequate sleep, mindfulness practices, and maintaining social connections are fundamental pillars of good mental health. It's important to recognize warning signs and seek professional help when needed. Breaking the stigma around mental health discussions encourages more people to seek support and creates a more understanding society.",
                AuthorId = adminUser.Id,
                CategoryId = healthCategory?.Id ?? defaultCategory.Id,
                ImageUrl = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&w=800&q=80",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddHours(-4),
                UpdatedAt = DateTime.UtcNow.AddHours(-4)
            },
            
            // Bulgarian Articles
            new NewsArticle
            {
                Title = "Добре дошли в нашия новинарски сайт",
                Preview = "Въведение в нашата новинарска платформа на български език.",
                Body = "Това е примерна статия на български език. Нашата платформа поддържа многоезично съдържание и може да представи новини както на английски, така и на български език. Стремим се да предоставим качествена информация на нашите читатели. Целта ни е да създадем общност от хора, които търсят надеждни и актуални новини.",
                AuthorId = adminUser.Id,
                CategoryId = cultureCategory?.Id ?? defaultCategory.Id,
                ImageUrl = "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&w=800&q=80",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddHours(-3),
                UpdatedAt = DateTime.UtcNow.AddHours(-3)
            },
            new NewsArticle
            {
                Title = "Технологични новости от България",
                Preview = "Преглед на технологичното развитие в България.",
                Body = "България се развива като важен технологичен център в Европа. Софтуерни компании, стартъпи и иновативни проекти процъфтяват в страната, привличайки международно внимание. Технологичният сектор в България продължава да расте с впечатляващи темпове. Градове като София, Пловдив и Варна стават центрове на технологичните иновации, предлагайки отлични възможности за развитие на IT специалистите.",
                AuthorId = adminUser.Id,
                CategoryId = techCategory?.Id ?? defaultCategory.Id,
                ImageUrl = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=800&q=80",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddHours(-8),
                UpdatedAt = DateTime.UtcNow.AddHours(-8)
            },
            new NewsArticle
            {
                Title = "Как да изградим стабилен личен бюджет в условията на несигурна икономика",
                Preview = "Практически съвети за създаване и поддържане на личен бюджет в трудни времена.",
                Body = "Личният бюджет е основата на финансовата стабилност. В условията на икономическа несигурност е още по-важно да имаме ясна представа за доходите и разходите си. Първата стъпка е точното проследяване на всички постъпления и плащания в продължение на поне един месец. След това можем да категоризираме разходите си като задължителни (наем, храна, транспорт) и желани (развлечения, хоби). Важно е да заделим средства за спестявания - дори и минимална сума от 5-10% от дохода може да направи разлика в дългосрочен план. Препоръчва се също така да имаме резерв за непредвидени разходи в размер на поне 3-6 месечни заплати. Редовното преразглеждане на бюджета и корекциите при необходимост са ключови за неговия успех.",
                AuthorId = adminUser.Id,
                CategoryId = financeCategory?.Id ?? defaultCategory.Id,
                ImageUrl = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&w=800&q=80",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddHours(-5),
                UpdatedAt = DateTime.UtcNow.AddHours(-5)
            },
            new NewsArticle
            {
                Title = "Минимализъм: Изкуството да живееш с по-малко",
                Preview = "Как минималистичният начин на живот може да подобри качеството ви на живот.",
                Body = "Минимализмът е философия, която учи да се съсредоточим върху наистина важните неща в живота и да се освободим от излишното. Това не означава да живееш в празна стая, а да бъдеш внимателен с това, което избираш да притежаваш и правиш. Започнете с малки стъпки - прегледайте дрехите си и оставете само тези, които наистина носите. Приложете същия принцип към цифровия си живот - изтрийте ненужните приложения и файлове. Минимализмът помага да намалим стреса, да увеличим продуктивността и да намерим повече време за хората и занаятите, които наистина ни вдъхновяват. Целта е да живеем по-съзнателно и целенасочено.",
                AuthorId = adminUser.Id,
                CategoryId = lifestyleCategory?.Id ?? defaultCategory.Id,
                ImageUrl = "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&w=800&q=80",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddHours(-1),
                UpdatedAt = DateTime.UtcNow.AddHours(-1)
            },
            new NewsArticle
            {
                Title = "Психично здраве и благополучие в съвременното общество",
                Preview = "Разбиране на важността на психичното здраве и стратегии за поддържане на психологическо благополучие.",
                Body = "Психичното здраве се превърна в критична тема в днешното забързано общество. Стресът, тревожността и депресията засягат милиони хора по света, което прави от съществено значение да приоритизираме психологическото благополучие наред с физическото здраве. Редовните упражнения, достатъчният сън, практиките на осъзнатост и поддържането на социални връзки са основните стълбове на доброто психично здраве. Важно е да разпознаваме предупредителните знаци и да търсим професионална помощ при нужда. Преодоляването на стигмата около дискусиите за психично здраве насърчава повече хора да търсят подкрепа и създава по-разбиращо общество.",
                AuthorId = adminUser.Id,
                CategoryId = healthCategory?.Id ?? defaultCategory.Id,
                ImageUrl = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&w=800&q=80",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddMinutes(-30),
                UpdatedAt = DateTime.UtcNow.AddMinutes(-30)
            }
        };

        context.Articles.AddRange(testArticles);
        await context.SaveChangesAsync();
    }
}
