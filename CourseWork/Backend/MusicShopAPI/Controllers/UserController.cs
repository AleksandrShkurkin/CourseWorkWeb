using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class UserController : Controller
{
    private readonly ApiDbContext _dbContext;

    public UserController(ApiDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(string userName, string email, string password)
    {
        if (await _dbContext.User.AnyAsync(u => u.Email == email))
        {
            return BadRequest(new { message = "User with this email already exists" });
        }

        var user = new User
        {
            UserName = userName,
            Email = email,
            Password = password,
            IsAdmin = false,
            ShoppingCart = new List<ShoppingCart>()
        };

        _dbContext.User.Add(user);
        await _dbContext.SaveChangesAsync();

        var currUser = await _dbContext.User.FirstOrDefaultAsync(u => u.Email == email);
        return Ok(new { message = "User registered successfully", idSave = currUser.Id });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(string email, string password)
    {
        var user = await _dbContext.User.SingleOrDefaultAsync(u => u.Email == email && u.Password == password);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        return Ok(new { message = "Login successful", idSave = user.Id, isAdmin = user.IsAdmin });
    }

    [HttpGet("{userId}/cart/get")]
    public async Task<IActionResult> GetCart(int userId)
    {
        var cartItems = await _dbContext.ShoppingCart
            .Where(c => c.UserId == userId)
            .Include(c => c.Instrument)
            .Select(c => new
            {
                c.Id,
                c.Quantity,
                instrumentId = c.Instrument.Id,
                c.Instrument.InstrumentName,
                c.Instrument.InstrumentBrand,
                c.Instrument.Price,
                c.Instrument.ImagePath
            })
            .ToListAsync();

        return Ok(cartItems);
    }

    [HttpPost("{userId}/cart/add")]
    public async Task<IActionResult> AddToCart(int userId, int instrumentId)
    {
        var userExists = await _dbContext.User.AnyAsync(u => u.Id == userId);
        if (!userExists) return NotFound("User not found.");

        var instrumentExists = await _dbContext.Instrument.AnyAsync(i => i.Id == instrumentId);
        if (!instrumentExists) return NotFound("Instrument not found.");

        var cartItem = await _dbContext.ShoppingCart
            .SingleOrDefaultAsync(c => c.UserId == userId && c.InstrumentId == instrumentId);

        if (cartItem != null)
        {
            cartItem.Quantity += 1;
        }
        else
        {
            _dbContext.ShoppingCart.Add(new ShoppingCart
            {
                UserId = userId,
                InstrumentId = instrumentId,
                Quantity = 1
            });
        }

        await _dbContext.SaveChangesAsync();
        return Ok(new { message = "Item added to cart." });
    }

    [HttpDelete("{userId}/cart/{cartItemId}")]
    public async Task<IActionResult> RemoveFromCart(int userId, int cartItemId)
    {
        var cartItem = await _dbContext.ShoppingCart
            .SingleOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId);

        if (cartItem == null) return NotFound("Cart item not found.");

        if (cartItem.Quantity - 1 > 0)
        {
            cartItem.Quantity -= 1;
        }
        else
        {
            _dbContext.ShoppingCart.Remove(cartItem);
        }
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Item removed from cart." });
    }

    [HttpDelete("{userId}/cart/{cartItemId}/all")]
    public async Task<IActionResult> RemoveFromCartAll(int userId, int cartItemId)
    {
        var cartItem = await _dbContext.ShoppingCart
            .SingleOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId);

        if (cartItem == null) return NotFound("Cart item not found.");

        _dbContext.ShoppingCart.Remove(cartItem);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Item removed from cart." });
    }

    [HttpDelete("{userId}/cart/clean")]
    public async Task<IActionResult> CleanCart(int userId)
    {
        var cartItems = await _dbContext.ShoppingCart.Where(s => s.UserId == userId).ToListAsync();

        if (cartItems == null) return NotFound("The cart is empty");

        _dbContext.ShoppingCart.RemoveRange(cartItems);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Cart cleaned" });
    }

    [HttpPost("update")]
    public async Task<IActionResult> Update(int userId, string oldPass, string userName = "", string newEmail = "", string newPass = "")
    {
        var userInfo = await _dbContext.User.FirstOrDefaultAsync(u => u.Id == userId);

        if (oldPass != userInfo.Password)
        {
            return Unauthorized(new { message = "Wrong password" });
        }

        if (!string.IsNullOrEmpty(userName.Trim()))
        {
            userInfo.UserName = userName;
        }
        if (!string.IsNullOrEmpty(newEmail.Trim()))
        {
            userInfo.Email = newEmail;
        }
        if (!string.IsNullOrEmpty(newPass.Trim()))
        {
            userInfo.Password = newPass;
        }

        _dbContext.User.Update(userInfo);
        await _dbContext.SaveChangesAsync();

        return Ok(userInfo);
    }

    [HttpGet("allUsers")]
    public async Task<ActionResult> GetAllUsers()
    {
        var allUsers = await _dbContext.User
        .Include(u => u.ShoppingCart)
        .ThenInclude(u => u.Instrument)
        .Select(u => new
        {
            u.Id,
            u.UserName,
            u.Email,
            u.IsAdmin,
            ShoppingCart = u.ShoppingCart.Select(c => new
            {
                c.Id,
                c.Quantity,
                instrumentId = c.Instrument.Id,
                c.Instrument.InstrumentName,
                c.Instrument.InstrumentBrand,
                c.Instrument.Price
            }).ToList(),
        }).ToListAsync();

        return Ok(allUsers);
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUserInfo(int userId)
    {
        var userInfo = await _dbContext.User.SingleOrDefaultAsync(u => u.Id == userId);

        return Ok(userInfo);
    }

    [HttpDelete("{userId}/delete")]
    public async Task<IActionResult> DeleteUser(int userId)
    {
        var user = await _dbContext.User.SingleOrDefaultAsync(u => u.Id == userId);

        var userCarts = await _dbContext.ShoppingCart.Where(u => u.UserId == userId).ToListAsync();

        _dbContext.ShoppingCart.RemoveRange(userCarts);
        _dbContext.User.Remove(user);
        await _dbContext.SaveChangesAsync();

        return Ok(new {message = user});
    }
}