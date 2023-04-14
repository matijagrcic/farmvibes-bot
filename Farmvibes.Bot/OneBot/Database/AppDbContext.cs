
using Microsoft.EntityFrameworkCore;
using OneBot.Models;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

namespace OneBot.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
                : base(options)
        {
        }

        public DbSet<BotUser> bot_user { get; set; }
        public DbSet<BotUserContact> bot_user_contact { get; set; }
        public DbSet<Channel> channel { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BotUser>()
             .Property(f => f.id)
            .ValueGeneratedOnAdd();

            modelBuilder.Entity<BotUser>()
                .Property(f => f.created_at)
                .HasDefaultValueSql("getDate()");

            modelBuilder.Entity<BotUserContact>()
                .Property(f => f.id)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<BotUserContact>()
                .HasOne<BotUser>(s => s.botUser)
                .WithMany(x => x.botUserContacts)
                .HasForeignKey(k => k.user_id);

        }
    }
}
