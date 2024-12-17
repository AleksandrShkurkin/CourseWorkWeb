using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class InstrumentController : ControllerBase
{
    private readonly ApiDbContext _dbContext;
    private readonly IWebHostEnvironment _environment;

    public InstrumentController(IWebHostEnvironment environment, ApiDbContext dbContext)
    {
        _dbContext = dbContext;
        _environment = environment;
    }

    [HttpPost("add")]
    public async Task<IActionResult> Add(string name, string brand, float price, IFormFile image)
    {
        if (await _dbContext.Instrument.AnyAsync(i => i.InstrumentName == name && i.InstrumentBrand == brand))
        {
            return BadRequest(new { message = "This instrument already exists" });
        }

        if (image == null || image.Length == 0)
        {
            return BadRequest(new { message = "No image uploaded" });
        }

        if (name.Trim() == "" || name == null)
        {
            return BadRequest(new { message = "No name given" });
        }

        if (brand.Trim() == "" || brand == null)
        {
            return BadRequest(new { message = "No brand given" });
        }

        if (price <= 0 || float.IsNaN(price))
        {
            return BadRequest(new { message = "No price or invalid price given" });
        }

        var uploadsFolder = Path.Combine(_environment.WebRootPath, "images");
        Directory.CreateDirectory(uploadsFolder);
        var fileName = $"{Guid.NewGuid()}_{image.FileName}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        var instrument = new Instrument
        {
            InstrumentName = name,
            InstrumentBrand = brand,
            Price = price,
            ImagePath = $"/images/{fileName}"
        };

        _dbContext.Instrument.Add(instrument);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "New instument added" });
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> Delete(int id)
    {
        var instrumentExists = await _dbContext.Instrument.SingleOrDefaultAsync(i => i.Id == id);
        if (instrumentExists == null)
        {
            return BadRequest(new { message = "No instrument exists" });
        }

        var shoppingCartsExists = await _dbContext.ShoppingCart
        .Where(c => c.InstrumentId == id)
        .ToListAsync();

        if (shoppingCartsExists.Any())
        {
            _dbContext.ShoppingCart.RemoveRange(shoppingCartsExists);
        }

        _dbContext.Instrument.Remove(instrumentExists);
        await _dbContext.SaveChangesAsync();

        var resultIntruments = await _dbContext.Instrument.ToListAsync();

        return Ok(resultIntruments);
    }

    [HttpPost("update")]
    public async Task<IActionResult> Update(int id, string name = "", string brand = "", float price = 0, IFormFile? image = null)
    {
        var instrument = await _dbContext.Instrument.FirstOrDefaultAsync(i => i.Id == id);

        if (image != null)
        {
            var oldImage = Path.Combine(_environment.WebRootPath, instrument.ImagePath.TrimStart('/'));

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "images");
            var fileName = $"{Guid.NewGuid()}_{image.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }
            instrument.ImagePath = $"/images/{fileName}";
            System.IO.File.Delete(oldImage);
        }

        if (!string.IsNullOrEmpty(name.Trim()))
        {
            instrument.InstrumentName = name;
        }
        if (!string.IsNullOrEmpty(brand.Trim()))
        {
            instrument.InstrumentBrand = brand;
        }
        if (price > 0)
        {
            instrument.Price = price;
        }

        _dbContext.Instrument.Update(instrument);

        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Instrument updated succesfully" });
    }

    [HttpGet("readAll")]
    public async Task<IActionResult> ReadAll()
    {
        var instruments = await _dbContext.Instrument.ToListAsync();

        return Ok(instruments);
    }

    [HttpGet("readFiltered")]
    public async Task<IActionResult> ReadFilter(string searchName = "", string searchBrand = "", float priceFilter = 0f, int filterMode = -1)
    {
        var query = _dbContext.Instrument.AsQueryable();

        if (!string.IsNullOrEmpty(searchName))
        {
            query = query.Where(i => i.InstrumentName.ToLower().Contains(searchName.ToLower()));
        }
        if (!string.IsNullOrEmpty(searchBrand))
        {
            query = query.Where(i => i.InstrumentBrand.ToLower().Contains(searchBrand.ToLower()));
        }
        if (priceFilter >= 0)
        {
            switch (filterMode)
            {
                case -1:
                    query = query.Where(i => i.Price >= priceFilter);
                    break;
                case 0:
                    query = query.Where(i => i.Price == priceFilter);
                    break;
                case 1:
                    query = query.Where(i => i.Price <= priceFilter);
                    break;
            }
        }

        var filteredInstruments = await query.ToListAsync();

        return Ok(filteredInstruments);
    }
}